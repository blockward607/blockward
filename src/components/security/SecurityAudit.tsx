
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/SecurityService';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export const SecurityAudit = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runSecurityAudit = async () => {
    setLoading(true);
    const auditResults: SecurityCheck[] = [];

    // Check 1: RLS enabled on critical tables
    try {
      const { data: rlsStatus } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['students', 'notifications', 'classrooms', 'grades']);
      
      const criticalTables = ['students', 'notifications', 'classrooms', 'grades'];
      const unprotectedTables = criticalTables.filter(table => 
        !rlsStatus?.some(t => t.tablename === table && t.rowsecurity)
      );

      if (unprotectedTables.length === 0) {
        auditResults.push({
          name: 'Row Level Security',
          status: 'pass',
          message: 'RLS is enabled on all critical tables'
        });
      } else {
        auditResults.push({
          name: 'Row Level Security',
          status: 'fail',
          message: `RLS not enabled on: ${unprotectedTables.join(', ')}`
        });
      }
    } catch (error) {
      auditResults.push({
        name: 'Row Level Security',
        status: 'warning',
        message: 'Could not verify RLS status'
      });
    }

    // Check 2: Input validation
    const testInputs = [
      "'; DROP TABLE students;--",
      "<script>alert('xss')</script>",
      "../../etc/passwd",
      "admin'/*",
      "1; DELETE FROM users;--"
    ];

    let inputValidationPassed = true;
    for (const input of testInputs) {
      try {
        const sanitized = SecurityService.sanitizeInput(input);
        if (sanitized === input) {
          inputValidationPassed = false;
          break;
        }
      } catch {
        // Expected for malicious inputs
      }
    }

    auditResults.push({
      name: 'Input Validation',
      status: inputValidationPassed ? 'pass' : 'fail',
      message: inputValidationPassed 
        ? 'Input sanitization working correctly'
        : 'Input validation may be insufficient'
    });

    // Check 3: UUID validation
    const invalidUUIDs = ['123', 'not-a-uuid', "'; DROP TABLE users;--"];
    let uuidValidationPassed = true;
    
    for (const uuid of invalidUUIDs) {
      if (SecurityService.isValidUUID(uuid)) {
        uuidValidationPassed = false;
        break;
      }
    }

    auditResults.push({
      name: 'UUID Validation',
      status: uuidValidationPassed ? 'pass' : 'fail',
      message: uuidValidationPassed 
        ? 'UUID validation working correctly'
        : 'UUID validation is insufficient'
    });

    // Check 4: Email validation
    const invalidEmails = ['not-an-email', 'test@', '@domain.com', 'a'.repeat(500) + '@test.com'];
    let emailValidationPassed = true;
    
    for (const email of invalidEmails) {
      if (SecurityService.isValidEmail(email)) {
        emailValidationPassed = false;
        break;
      }
    }

    auditResults.push({
      name: 'Email Validation',
      status: emailValidationPassed ? 'pass' : 'fail',
      message: emailValidationPassed 
        ? 'Email validation working correctly'
        : 'Email validation is insufficient'
    });

    // Check 5: Authentication status
    try {
      const { data: { session } } = await supabase.auth.getSession();
      auditResults.push({
        name: 'Authentication',
        status: session ? 'pass' : 'warning',
        message: session ? 'User authenticated' : 'No active session'
      });
    } catch (error) {
      auditResults.push({
        name: 'Authentication',
        status: 'fail',
        message: 'Authentication check failed'
      });
    }

    setChecks(auditResults);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fail':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="p-6 bg-black/50 border-purple-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold">Security Audit</h3>
      </div>
      
      <Button 
        onClick={runSecurityAudit} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Running Audit...' : 'Run Security Audit'}
      </Button>

      {checks.length > 0 && (
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium">{check.name}</h4>
                  <p className="text-sm text-gray-400">{check.message}</p>
                </div>
              </div>
              <Badge className={getStatusColor(check.status)}>
                {check.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
