import axios from 'axios';

type LogStack = 'backend' | 'frontend';
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type LogPackage =
  | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain'
  | 'handler' | 'repository' | 'route' | 'service'
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'
  | 'auth' | 'config' | 'middleware' | 'utils';

/**
 * Log function to send logs to the evaluation service via local proxy.
 * @param stack - 'backend' | 'frontend'
 * @param level - 'debug' | 'info' | 'warn' | 'error' | 'fatal'
 * @param packageName - The package where the log originated
 * @param message - The log message
 */
export async function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string
): Promise<void> {
  try {
    // Call the local Next.js proxy route to bypass CORS
    await axios.post(
      '/api/logs',
      { stack, level, package: packageName, message },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    // Silent fail to not break app UX if logging service is down
  }
}
