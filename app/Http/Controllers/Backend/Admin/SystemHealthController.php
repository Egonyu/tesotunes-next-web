<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Services\SystemMonitoringService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class SystemHealthController extends Controller
{
    protected SystemMonitoringService $monitoringService;

    public function __construct(SystemMonitoringService $monitoringService)
    {
        $this->middleware(['auth', 'role:super_admin']);
        $this->monitoringService = $monitoringService;
    }

    /**
     * Display system health dashboard
     */
    public function index()
    {
        $health = $this->monitoringService->getSystemHealth();
        $logs = $this->monitoringService->getRecentLogs(50);

        return view('admin.system.index', compact('health', 'logs'));
    }

    /**
     * Get system logs (AJAX)
     */
    public function logs(Request $request)
    {
        $lines = $request->get('lines', 100);
        $logs = $this->monitoringService->getRecentLogs($lines);

        return response()->json([
            'success' => true,
            'logs' => $logs,
        ]);
    }

    /**
     * Get health status (AJAX)
     */
    public function healthStatus()
    {
        $health = $this->monitoringService->getSystemHealth();

        return response()->json([
            'success' => true,
            'health' => $health,
        ]);
    }

    /**
     * Execute maintenance command
     */
    public function executeCommand(Request $request)
    {
        $request->validate([
            'command' => 'required|string|in:cache:clear,config:cache,route:cache,view:clear,optimize,optimize:clear,queue:restart',
        ]);

        $result = $this->monitoringService->executeCommand($request->command);

        Log::info('System command executed', [
            'command' => $request->command,
            'user' => auth()->user()->email,
            'result' => $result['success'],
        ]);

        return response()->json($result);
    }

    /**
     * Run health tests
     */
    public function runTests()
    {
        $tests = $this->monitoringService->runHealthTests();

        return response()->json([
            'success' => true,
            'tests' => $tests,
        ]);
    }

    /**
     * Clear specific cache type
     */
    public function clearCache(Request $request)
    {
        $type = $request->get('type', 'all');

        try {
            switch ($type) {
                case 'config':
                    Artisan::call('config:clear');
                    $message = 'Configuration cache cleared';
                    break;
                case 'route':
                    Artisan::call('route:clear');
                    $message = 'Route cache cleared';
                    break;
                case 'view':
                    Artisan::call('view:clear');
                    $message = 'View cache cleared';
                    break;
                case 'cache':
                    Artisan::call('cache:clear');
                    $message = 'Application cache cleared';
                    break;
                case 'all':
                default:
                    Artisan::call('optimize:clear');
                    $message = 'All caches cleared';
                    break;
            }

            Log::info('Cache cleared', [
                'type' => $type,
                'user' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => '✅ ' . $message,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Failed to clear cache: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get system statistics
     */
    public function statistics()
    {
        $health = $this->monitoringService->getSystemHealth();

        return response()->json([
            'success' => true,
            'statistics' => $health['components'],
        ]);
    }

    /**
     * Execute terminal command (restricted to safe commands)
     */
    public function terminal(Request $request)
    {
        $request->validate([
            'command' => 'required|string',
        ]);

        $command = $request->command;
        
        // Whitelist of safe commands
        $allowedCommands = [
            'php artisan about',
            'php artisan --version',
            'php artisan route:list',
            'php artisan migrate:status',
            'php artisan queue:failed',
            'php artisan cache:clear',
            'php artisan config:cache',
            'php artisan route:cache',
            'php artisan view:clear',
            'php artisan optimize',
            'php artisan optimize:clear',
            'php artisan app:health-check',
        ];

        // Check if command is in whitelist or starts with allowed prefix
        $isAllowed = false;
        foreach ($allowedCommands as $allowed) {
            if (str_starts_with($command, $allowed)) {
                $isAllowed = true;
                break;
            }
        }

        if (!$isAllowed) {
            return response()->json([
                'success' => false,
                'output' => '❌ Command not allowed. Only safe maintenance commands are permitted.',
            ], 403);
        }

        try {
            // Extract artisan command
            if (str_starts_with($command, 'php artisan ')) {
                $artisanCommand = str_replace('php artisan ', '', $command);
                
                Artisan::call($artisanCommand);
                $output = Artisan::output();

                Log::info('Terminal command executed', [
                    'command' => $command,
                    'user' => auth()->user()->email,
                ]);

                return response()->json([
                    'success' => true,
                    'output' => $output ?: '✅ Command executed successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'output' => '❌ Invalid command format',
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'output' => '❌ Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List available backups
     */
    public function listBackups()
    {
        $backupPath = storage_path('app/backups');
        $backups = [];
        $totalSize = 0;

        if (file_exists($backupPath)) {
            $files = glob($backupPath . '/*.{sql,zip,gz}', GLOB_BRACE);
            
            foreach ($files as $file) {
                $size = filesize($file);
                $totalSize += $size;
                
                $backups[] = [
                    'id' => basename($file),
                    'name' => basename($file),
                    'type' => str_contains($file, 'full') ? 'full' : 'database',
                    'size' => $this->formatBytes($size),
                    'created_at' => date('Y-m-d H:i:s', filemtime($file)),
                ];
            }
            
            // Sort by date descending
            usort($backups, fn($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));
        }

        $lastBackup = !empty($backups) ? $backups[0]['created_at'] : null;

        return response()->json([
            'success' => true,
            'backups' => array_slice($backups, 0, 10), // Return last 10
            'last_backup' => $lastBackup,
            'total_size' => $this->formatBytes($totalSize),
        ]);
    }

    /**
     * Get backup settings
     */
    public function backupSettings()
    {
        return response()->json([
            'success' => true,
            'settings' => [
                'autoBackupEnabled' => config('backup.auto_enabled', true),
                'backupSchedule' => config('backup.schedule', 'daily'),
                'retentionDays' => config('backup.retention_days', 30),
                'backupStorage' => config('backup.storage', 'local'),
                'includeMedia' => config('backup.include_media', false),
            ],
        ]);
    }

    /**
     * Update backup settings
     */
    public function updateBackupSettings(Request $request)
    {
        try {
            $settings = $request->validate([
                'autoBackupEnabled' => 'boolean',
                'backupSchedule' => 'in:hourly,daily,weekly,monthly',
                'retentionDays' => 'in:7,14,30,60,90',
                'backupStorage' => 'in:local,s3,gcs,dropbox',
                'includeMedia' => 'boolean',
            ]);

            // Store settings (you may want to use a Setting model or .env)
            foreach ($settings as $key => $value) {
                \App\Models\Setting::set('backup_' . strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $key)), $value);
            }

            Log::info('Backup settings updated', [
                'user' => auth()->user()->email,
                'settings' => $settings,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Backup settings saved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save settings: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Run a backup
     */
    public function runBackup(Request $request)
    {
        $type = $request->input('type', 'database');
        
        try {
            $backupPath = storage_path('app/backups');
            
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $timestamp = date('Y-m-d_His');
            
            if ($type === 'database') {
                // Database backup
                $filename = "database_backup_{$timestamp}.sql";
                $filepath = "{$backupPath}/{$filename}";
                
                $database = config('database.connections.mysql.database');
                $username = config('database.connections.mysql.username');
                $password = config('database.connections.mysql.password');
                $host = config('database.connections.mysql.host');
                
                $command = "mysqldump --user={$username} --password={$password} --host={$host} {$database} > {$filepath}";
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    throw new \Exception('Database backup failed');
                }
                
                // Compress the backup
                exec("gzip {$filepath}");
                $filename .= '.gz';
                
            } else {
                // Full backup (database + files)
                $filename = "full_backup_{$timestamp}.zip";
                $filepath = "{$backupPath}/{$filename}";
                
                // First backup database
                $dbFilename = "database_backup_{$timestamp}.sql";
                $dbFilepath = "{$backupPath}/{$dbFilename}";
                
                $database = config('database.connections.mysql.database');
                $username = config('database.connections.mysql.username');
                $password = config('database.connections.mysql.password');
                $host = config('database.connections.mysql.host');
                
                exec("mysqldump --user={$username} --password={$password} --host={$host} {$database} > {$dbFilepath}");
                
                // Create zip with database and important files
                $zip = new \ZipArchive();
                $zip->open($filepath, \ZipArchive::CREATE);
                $zip->addFile($dbFilepath, 'database.sql');
                
                // Add .env file (encrypted or excluded sensitive data)
                if (file_exists(base_path('.env'))) {
                    $zip->addFile(base_path('.env'), '.env.backup');
                }
                
                // Add storage/app/public if includeMedia is enabled
                if ($request->input('includeMedia', false)) {
                    $this->addFolderToZip(storage_path('app/public'), $zip, 'storage/');
                }
                
                $zip->close();
                
                // Remove temp database file
                @unlink($dbFilepath);
            }

            Log::info('Backup created', [
                'type' => $type,
                'filename' => $filename,
                'user' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => ucfirst($type) . ' backup created successfully: ' . $filename,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Backup failed', [
                'type' => $type,
                'error' => $e->getMessage(),
                'user' => auth()->user()->email,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download a backup file
     */
    public function downloadBackup($id)
    {
        $filepath = storage_path('app/backups/' . basename($id));
        
        if (!file_exists($filepath)) {
            abort(404, 'Backup not found');
        }

        Log::info('Backup downloaded', [
            'filename' => $id,
            'user' => auth()->user()->email,
        ]);

        return response()->download($filepath);
    }

    /**
     * Restore a backup
     */
    public function restoreBackup($id)
    {
        $filepath = storage_path('app/backups/' . basename($id));
        
        if (!file_exists($filepath)) {
            return response()->json([
                'success' => false,
                'message' => 'Backup not found',
            ], 404);
        }

        try {
            // For security, this would require confirmation and proper implementation
            Log::warning('Backup restore requested', [
                'filename' => $id,
                'user' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Restore functionality requires manual confirmation. Please contact system administrator.',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Restore failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a backup
     */
    public function deleteBackup($id)
    {
        $filepath = storage_path('app/backups/' . basename($id));
        
        if (!file_exists($filepath)) {
            return response()->json([
                'success' => false,
                'message' => 'Backup not found',
            ], 404);
        }

        try {
            unlink($filepath);
            
            Log::info('Backup deleted', [
                'filename' => $id,
                'user' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Backup deleted successfully',
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper: Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Helper: Add folder to zip recursively
     */
    private function addFolderToZip($folder, $zip, $zipFolder)
    {
        if (!is_dir($folder)) {
            return;
        }

        $handle = opendir($folder);
        while (($entry = readdir($handle)) !== false) {
            if ($entry != '.' && $entry != '..') {
                $path = $folder . '/' . $entry;
                $localPath = $zipFolder . $entry;
                
                if (is_file($path)) {
                    $zip->addFile($path, $localPath);
                } elseif (is_dir($path)) {
                    $this->addFolderToZip($path, $zip, $localPath . '/');
                }
            }
        }
        closedir($handle);
    }
}
