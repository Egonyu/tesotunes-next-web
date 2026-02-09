@extends('layouts.admin')

@section('title', 'System Health & Monitoring')

@section('content')
<div x-data="systemHealthDashboard()" x-init="init()" class="p-6 space-y-6">
    
    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span class="text-4xl">🏥</span>
                System Health & Monitoring
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Monitor system health, view logs, and perform maintenance tasks
            </p>
        </div>
        <div class="flex items-center gap-3">
            <button @click="refreshHealth()" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                <svg class="w-4 h-4" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
            </button>
        </div>
    </div>

    {{-- Overall Health Score --}}
    <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-semibold opacity-90">Overall System Health</h2>
                <div class="mt-4 flex items-end gap-4">
                    <div class="text-6xl font-bold" x-text="health.overall_score || '0'"></div>
                    <div class="text-2xl opacity-75 mb-2">/100</div>
                </div>
                <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <span class="text-2xl" x-text="getStatusEmoji(health.status)"></span>
                    <span class="text-lg font-semibold capitalize" x-text="health.status || 'Unknown'"></span>
                </div>
            </div>
            <div class="text-right">
                <div class="text-sm opacity-75">Last Updated</div>
                <div class="text-lg font-medium" x-text="formatTime(health.timestamp)"></div>
                <button @click="refreshHealth()" class="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all">
                    Update Now
                </button>
            </div>
        </div>
    </div>

    {{-- Critical Alerts --}}
    <div x-show="health.alerts && health.alerts.length > 0" class="space-y-3">
        <template x-for="alert in health.alerts" :key="alert.title">
            <div class="rounded-lg p-4 border-l-4" :class="{
                'bg-red-50 border-red-500 dark:bg-red-900/20': alert.level === 'critical',
                'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20': alert.level === 'warning',
                'bg-blue-50 border-blue-500 dark:bg-blue-900/20': alert.level === 'info'
            }">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl" x-text="alert.level === 'critical' ? '🔥' : (alert.level === 'warning' ? '⚠️' : 'ℹ️')"></span>
                            <h3 class="font-semibold text-gray-900 dark:text-white" x-text="alert.title"></h3>
                        </div>
                        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300" x-text="alert.message"></p>
                        <p class="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200" x-text="'Action: ' + alert.action"></p>
                    </div>
                </div>
            </div>
        </template>
    </div>

    {{-- Component Health Grid --}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {{-- Database --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2" :class="getStatusBorderClass(health.components?.database?.status)">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-4xl">💾</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Database</h3>
                </div>
                <span class="text-2xl" x-text="getStatusEmoji(health.components?.database?.status)"></span>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Driver:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.database?.driver || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Response Time:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="(health.components?.database?.connection_time_ms || 0) + 'ms'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Users:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.database?.metrics?.users_count || 0"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Songs:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.database?.metrics?.songs_count || 0"></span>
                </div>
            </div>

            <div x-show="health.components?.database?.issues?.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <template x-for="issue in health.components?.database?.issues" :key="issue">
                    <div class="text-xs text-red-600 dark:text-red-400 mt-1" x-text="issue"></div>
                </template>
            </div>
        </div>

        {{-- Storage --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2" :class="getStatusBorderClass(health.components?.storage?.status)">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-4xl">📁</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Storage</h3>
                </div>
                <span class="text-2xl" x-text="getStatusEmoji(health.components?.storage?.status)"></span>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Free Space:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.storage?.metrics?.local_storage?.free || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Total Space:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.storage?.metrics?.local_storage?.total || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Used:</span>
                    <span class="font-medium" :class="(health.components?.storage?.metrics?.local_storage?.used_percentage || 0) > 80 ? 'text-red-600' : 'text-gray-900 dark:text-white'" x-text="(health.components?.storage?.metrics?.local_storage?.used_percentage || 0).toFixed(1) + '%'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Storage Link:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.storage?.metrics?.storage_link || 'N/A'"></span>
                </div>
            </div>

            <div x-show="health.components?.storage?.issues?.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <template x-for="issue in health.components?.storage?.issues" :key="issue">
                    <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1" x-text="issue"></div>
                </template>
            </div>
        </div>

        {{-- Cache --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2" :class="getStatusBorderClass(health.components?.cache?.status)">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-4xl">🚀</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Cache</h3>
                </div>
                <span class="text-2xl" x-text="getStatusEmoji(health.components?.cache?.status)"></span>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Driver:</span>
                    <span class="font-medium text-gray-900 dark:text-white capitalize" x-text="health.components?.cache?.driver || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Status:</span>
                    <span class="font-medium" :class="health.components?.cache?.working ? 'text-green-600' : 'text-red-600'" x-text="health.components?.cache?.working ? 'Working' : 'Failed'"></span>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="clearCache('cache')" class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Clear Cache
                </button>
            </div>

            <div x-show="health.components?.cache?.issues?.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <template x-for="issue in health.components?.cache?.issues" :key="issue">
                    <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1" x-text="issue"></div>
                </template>
            </div>
        </div>

        {{-- Queue --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2" :class="getStatusBorderClass(health.components?.queue?.status)">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-4xl">📬</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Queue</h3>
                </div>
                <span class="text-2xl" x-text="getStatusEmoji(health.components?.queue?.status)"></span>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Driver:</span>
                    <span class="font-medium text-gray-900 dark:text-white capitalize" x-text="health.components?.queue?.driver || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Pending Jobs:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.queue?.metrics?.pending_jobs || 0"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Failed Jobs:</span>
                    <span class="font-medium" :class="(health.components?.queue?.metrics?.failed_jobs || 0) > 10 ? 'text-red-600' : 'text-gray-900 dark:text-white'" x-text="health.components?.queue?.metrics?.failed_jobs || 0"></span>
                </div>
            </div>

            <div x-show="health.components?.queue?.issues?.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <template x-for="issue in health.components?.queue?.issues" :key="issue">
                    <div class="text-xs text-yellow-600 dark:text-yellow-400 mt-1" x-text="issue"></div>
                </template>
            </div>
        </div>

        {{-- Application --}}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2" :class="getStatusBorderClass(health.components?.application?.status)">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <span class="text-4xl">⚙️</span>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Application</h3>
                </div>
                <span class="text-2xl" x-text="getStatusEmoji(health.components?.application?.status)"></span>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Environment:</span>
                    <span class="font-medium text-gray-900 dark:text-white capitalize" x-text="health.components?.application?.metrics?.environment || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Debug Mode:</span>
                    <span class="font-medium" :class="health.components?.application?.metrics?.debug_mode ? 'text-red-600' : 'text-green-600'" x-text="health.components?.application?.metrics?.debug_mode ? 'Enabled' : 'Disabled'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Laravel:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.application?.metrics?.laravel_version || 'N/A'"></span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-400">PHP:</span>
                    <span class="font-medium text-gray-900 dark:text-white" x-text="health.components?.application?.metrics?.php_version || 'N/A'"></span>
                </div>
            </div>

            <div x-show="health.components?.application?.issues?.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <template x-for="issue in health.components?.application?.issues" :key="issue">
                    <div class="text-xs text-red-600 dark:text-red-400 mt-1" x-text="issue"></div>
                </template>
            </div>
        </div>

        {{-- Recommendations --}}
        <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
            <div class="flex items-center gap-3 mb-4">
                <span class="text-4xl">💡</span>
                <h3 class="text-lg font-semibold">Recommendations</h3>
            </div>
            
            <div x-show="health.recommendations && health.recommendations.length > 0" class="space-y-3">
                <template x-for="rec in health.recommendations" :key="rec.title">
                    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div class="flex items-start gap-2">
                            <span class="text-lg" x-text="rec.priority === 'high' ? '🔴' : (rec.priority === 'medium' ? '🟡' : '🟢')"></span>
                            <div class="flex-1">
                                <div class="font-semibold text-sm" x-text="rec.title"></div>
                                <div class="text-xs opacity-90 mt-1" x-text="rec.description"></div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            
            <div x-show="!health.recommendations || health.recommendations.length === 0" class="text-center py-4 opacity-75">
                <div class="text-3xl mb-2">✨</div>
                <div class="text-sm">System is optimized!</div>
            </div>
        </div>
    </div>

    {{-- Quick Actions --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">🛠️</span>
            Quick Maintenance Actions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button @click="clearCache('all')" class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <span>🧹</span>
                Clear All Caches
            </button>
            <button @click="clearCache('config')" class="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <span>⚙️</span>
                Clear Config
            </button>
            <button @click="clearCache('route')" class="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                <span>🛣️</span>
                Clear Routes
            </button>
            <button @click="clearCache('view')" class="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all flex items-center justify-center gap-2">
                <span>👁️</span>
                Clear Views
            </button>
            <button @click="runTests()" class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2">
                <span>🧪</span>
                Run Health Tests
            </button>
            <button @click="executeCommand('optimize')" class="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center justify-center gap-2">
                <span>⚡</span>
                Optimize App
            </button>
            <button @click="executeCommand('queue:restart')" class="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
                <span>🔄</span>
                Restart Queues
            </button>
            <button @click="showTerminal = !showTerminal" class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                <span>💻</span>
                Terminal
            </button>
        </div>
    </div>

    {{-- Backup & Recovery Settings --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6" x-data="backupManager()">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="text-2xl">💾</span>
                Backup & Recovery
            </h2>
            <div class="flex gap-2">
                <button @click="runBackup('database')" :disabled="backupRunning" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                    <span x-show="!backupRunning">🗄️</span>
                    <svg x-show="backupRunning" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Backup Database
                </button>
                <button @click="runBackup('full')" :disabled="backupRunning" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    <span x-show="!backupRunning">📦</span>
                    <svg x-show="backupRunning" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Full Backup
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {{-- Backup Settings --}}
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Backup Configuration</h3>
                
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-200">Auto Backup</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Automatically backup daily</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" x-model="settings.autoBackupEnabled" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Backup Schedule</label>
                        <select x-model="settings.backupSchedule" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Daily (at midnight)</option>
                            <option value="weekly">Weekly (Sunday midnight)</option>
                            <option value="monthly">Monthly (1st of month)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Retention Period</label>
                        <select x-model="settings.retentionDays" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            <option value="7">7 days</option>
                            <option value="14">14 days</option>
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                            <option value="90">90 days</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Backup Storage</label>
                        <select x-model="settings.backupStorage" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                            <option value="local">Local Storage</option>
                            <option value="s3">Amazon S3</option>
                            <option value="gcs">Google Cloud Storage</option>
                            <option value="dropbox">Dropbox</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-200">Include Media Files</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Backup uploaded music and images</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" x-model="settings.includeMedia" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button @click="saveSettings()" class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2">
                            <span>💾</span> Save Backup Settings
                        </button>
                    </div>
                </div>
            </div>
            
            {{-- Recent Backups --}}
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Backups</h3>
                
                <div class="space-y-3 max-h-96 overflow-y-auto">
                    <template x-for="backup in recentBackups" :key="backup.id">
                        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl" x-text="backup.type === 'full' ? '📦' : '🗄️'"></span>
                                <div>
                                    <p class="font-medium text-gray-700 dark:text-gray-200" x-text="backup.name"></p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        <span x-text="backup.size"></span> • <span x-text="backup.created_at"></span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button @click="downloadBackup(backup.id)" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50">
                                    ⬇️ Download
                                </button>
                                <button @click="restoreBackup(backup.id)" class="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50">
                                    🔄 Restore
                                </button>
                                <button @click="deleteBackup(backup.id)" class="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </template>
                    
                    <div x-show="recentBackups.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div class="text-4xl mb-2">📭</div>
                        <div>No backups found</div>
                        <p class="text-sm mt-2">Run a backup to get started</p>
                    </div>
                </div>
                
                {{-- Backup Status --}}
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl">ℹ️</span>
                        <div>
                            <p class="font-medium text-blue-800 dark:text-blue-200">Backup Info</p>
                            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Last backup: <span x-text="lastBackupTime || 'Never'"></span><br>
                                Total backups: <span x-text="recentBackups.length"></span><br>
                                Storage used: <span x-text="totalStorageUsed"></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Terminal --}}
    <div x-show="showTerminal" x-transition class="bg-gray-900 rounded-xl shadow-2xl p-6" style="display: none;">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                <span class="text-2xl">💻</span>
                System Terminal (Safe Commands Only)
            </h3>
            <button @click="showTerminal = false" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <div class="bg-black rounded-lg p-4 mb-4 max-h-96 overflow-y-auto font-mono text-sm">
            <template x-for="(output, index) in terminalOutput" :key="index">
                <div class="text-green-400 whitespace-pre-wrap" x-text="output"></div>
            </template>
            <div x-show="terminalOutput.length === 0" class="text-gray-500">
                Terminal ready. Enter a safe command below.
            </div>
        </div>
        
        <form @submit.prevent="executeTerminalCommand()" class="flex gap-2">
            <span class="text-green-400 font-mono">$</span>
            <input 
                type="text" 
                x-model="terminalCommand" 
                placeholder="php artisan about" 
                class="flex-1 bg-transparent text-white font-mono text-sm border-none outline-none"
            />
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Execute
            </button>
        </form>
        
        <div class="mt-4 text-xs text-gray-400">
            <div class="font-semibold mb-2">Available commands:</div>
            <div class="grid grid-cols-2 gap-2">
                <div>• php artisan about</div>
                <div>• php artisan route:list</div>
                <div>• php artisan migrate:status</div>
                <div>• php artisan queue:failed</div>
                <div>• php artisan cache:clear</div>
                <div>• php artisan app:health-check</div>
            </div>
        </div>
    </div>

    {{-- System Logs --}}
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="text-2xl">📝</span>
                Recent System Logs
            </h2>
            <button @click="refreshLogs()" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
                Refresh Logs
            </button>
        </div>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
            <template x-for="log in logs" :key="log.timestamp + log.message">
                <div class="flex items-start gap-3 p-3 rounded-lg border" :class="{
                    'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800': log.severity === 'error' || log.severity === 'critical',
                    'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800': log.severity === 'warning',
                    'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800': log.severity === 'info',
                    'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700': log.severity === 'debug'
                }">
                    <div class="flex-shrink-0 text-2xl" x-text="getSeverityEmoji(log.severity)"></div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span x-text="log.timestamp"></span>
                            <span>•</span>
                            <span class="uppercase font-semibold" :class="{
                                'text-red-600': log.severity === 'error' || log.severity === 'critical',
                                'text-yellow-600': log.severity === 'warning',
                                'text-blue-600': log.severity === 'info'
                            }" x-text="log.level"></span>
                        </div>
                        <div class="text-sm text-gray-900 dark:text-gray-100 break-words" x-text="log.human_readable || log.message"></div>
                    </div>
                </div>
            </template>
            
            <div x-show="logs.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                <div class="text-4xl mb-2">📭</div>
                <div>No recent logs</div>
            </div>
        </div>
    </div>

    {{-- Success/Error Toast --}}
    <div x-show="toast.show" x-transition x-init="$watch('toast.show', value => { if(value) setTimeout(() => toast.show = false, 3000) })" class="fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-2xl z-50" :class="{
        'bg-green-600 text-white': toast.type === 'success',
        'bg-red-600 text-white': toast.type === 'error'
    }" style="display: none;">
        <div class="flex items-center gap-3">
            <span class="text-2xl" x-text="toast.type === 'success' ? '✅' : '❌'"></span>
            <span x-text="toast.message"></span>
        </div>
    </div>
</div>

@push('scripts')
<script>
function backupManager() {
    return {
        backupRunning: false,
        settings: {
            autoBackupEnabled: true,
            backupSchedule: 'daily',
            retentionDays: '30',
            backupStorage: 'local',
            includeMedia: false
        },
        recentBackups: [],
        lastBackupTime: 'Loading...',
        totalStorageUsed: 'Calculating...',
        
        init() {
            this.loadBackups();
            this.loadSettings();
        },
        
        async loadBackups() {
            try {
                const response = await fetch('{{ route('admin.system.backups.list') }}');
                const data = await response.json();
                if (data.success) {
                    this.recentBackups = data.backups || [];
                    this.lastBackupTime = data.last_backup || 'Never';
                    this.totalStorageUsed = data.total_size || '0 MB';
                }
            } catch (error) {
                console.error('Failed to load backups:', error);
            }
        },
        
        async loadSettings() {
            try {
                const response = await fetch('{{ route('admin.system.backups.settings') }}');
                const data = await response.json();
                if (data.success) {
                    this.settings = { ...this.settings, ...data.settings };
                }
            } catch (error) {
                console.error('Failed to load backup settings:', error);
            }
        },
        
        async runBackup(type) {
            if (this.backupRunning) return;
            
            this.backupRunning = true;
            
            try {
                const response = await fetch('{{ route('admin.system.backups.run') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ type })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Alpine.store('toast')?.show('success', data.message || 'Backup created successfully');
                    await this.loadBackups();
                } else {
                    Alpine.store('toast')?.show('error', data.message || 'Backup failed');
                }
            } catch (error) {
                console.error('Backup error:', error);
                Alpine.store('toast')?.show('error', 'Failed to create backup');
            } finally {
                this.backupRunning = false;
            }
        },
        
        async saveSettings() {
            try {
                const response = await fetch('{{ route('admin.system.backups.settings.update') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(this.settings)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Alpine.store('toast')?.show('success', 'Backup settings saved');
                } else {
                    Alpine.store('toast')?.show('error', data.message || 'Failed to save settings');
                }
            } catch (error) {
                console.error('Settings error:', error);
                Alpine.store('toast')?.show('error', 'Failed to save settings');
            }
        },
        
        async downloadBackup(id) {
            window.location.href = `{{ url('admin/system/backups') }}/${id}/download`;
        },
        
        async restoreBackup(id) {
            if (!confirm('Are you sure you want to restore this backup? This will replace current data.')) {
                return;
            }
            
            try {
                const response = await fetch(`{{ url('admin/system/backups') }}/${id}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Alpine.store('toast')?.show('success', 'Backup restored successfully');
                } else {
                    Alpine.store('toast')?.show('error', data.message || 'Restore failed');
                }
            } catch (error) {
                Alpine.store('toast')?.show('error', 'Failed to restore backup');
            }
        },
        
        async deleteBackup(id) {
            if (!confirm('Are you sure you want to delete this backup?')) {
                return;
            }
            
            try {
                const response = await fetch(`{{ url('admin/system/backups') }}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Alpine.store('toast')?.show('success', 'Backup deleted');
                    await this.loadBackups();
                } else {
                    Alpine.store('toast')?.show('error', data.message || 'Delete failed');
                }
            } catch (error) {
                Alpine.store('toast')?.show('error', 'Failed to delete backup');
            }
        }
    };
}

function systemHealthDashboard() {
    return {
        health: @json($health),
        logs: @json($logs),
        loading: false,
        showTerminal: false,
        terminalCommand: '',
        terminalOutput: [],
        toast: {
            show: false,
            type: 'success',
            message: ''
        },
        
        init() {
            // Auto-refresh every 30 seconds
            setInterval(() => {
                this.refreshHealth(true);
            }, 30000);
        },
        
        async refreshHealth(silent = false) {
            if (!silent) this.loading = true;
            
            try {
                const response = await fetch('{{ route('admin.system.health.status') }}');
                const data = await response.json();
                
                if (data.success) {
                    this.health = data.health;
                }
            } catch (error) {
                console.error('Failed to refresh health:', error);
            } finally {
                if (!silent) this.loading = false;
            }
        },
        
        async refreshLogs() {
            try {
                const response = await fetch('{{ route('admin.system.logs') }}?lines=50');
                const data = await response.json();
                
                if (data.success) {
                    this.logs = data.logs;
                }
            } catch (error) {
                console.error('Failed to refresh logs:', error);
            }
        },
        
        async clearCache(type) {
            this.loading = true;
            
            try {
                const response = await fetch('{{ route('admin.system.cache.clear') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ type })
                });
                
                const data = await response.json();
                this.showToast(data.success ? 'success' : 'error', data.message);
                
                if (data.success) {
                    await this.refreshHealth();
                }
            } catch (error) {
                this.showToast('error', 'Failed to clear cache');
            } finally {
                this.loading = false;
            }
        },
        
        async executeCommand(command) {
            this.loading = true;
            
            try {
                const response = await fetch('{{ route('admin.system.command.execute') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ command })
                });
                
                const data = await response.json();
                this.showToast(data.success ? 'success' : 'error', data.message);
                
                if (data.success) {
                    await this.refreshHealth();
                }
            } catch (error) {
                this.showToast('error', 'Command execution failed');
            } finally {
                this.loading = false;
            }
        },
        
        async runTests() {
            this.loading = true;
            
            try {
                const response = await fetch('{{ route('admin.system.tests.run') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const passed = data.tests.filter(t => t.status).length;
                    const total = data.tests.length;
                    this.showToast('success', `Tests completed: ${passed}/${total} passed`);
                    
                    // Show detailed results in terminal
                    this.terminalOutput = data.tests.map(t => 
                        `${t.status ? '✅' : '❌'} ${t.name}: ${t.message}`
                    );
                    this.showTerminal = true;
                }
            } catch (error) {
                this.showToast('error', 'Failed to run tests');
            } finally {
                this.loading = false;
            }
        },
        
        async executeTerminalCommand() {
            if (!this.terminalCommand.trim()) return;
            
            this.terminalOutput.push(`$ ${this.terminalCommand}`);
            
            try {
                const response = await fetch('{{ route('admin.system.terminal') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ command: this.terminalCommand })
                });
                
                const data = await response.json();
                this.terminalOutput.push(data.output || 'Command executed');
                
                this.terminalCommand = '';
            } catch (error) {
                this.terminalOutput.push('❌ Error executing command');
            }
        },
        
        showToast(type, message) {
            this.toast = { show: true, type, message };
        },
        
        getStatusEmoji(status) {
            const emojis = {
                'healthy': '🟢',
                'warning': '🟡',
                'degraded': '🟠',
                'failed': '🔴',
                'critical': '🔥'
            };
            return emojis[status] || '⚪';
        },
        
        getSeverityEmoji(severity) {
            const emojis = {
                'critical': '🔥',
                'error': '❌',
                'warning': '⚠️',
                'info': 'ℹ️',
                'debug': '🐛'
            };
            return emojis[severity] || '📝';
        },
        
        getStatusBorderClass(status) {
            const classes = {
                'healthy': 'border-green-500',
                'warning': 'border-yellow-500',
                'degraded': 'border-orange-500',
                'failed': 'border-red-500',
                'critical': 'border-red-700'
            };
            return classes[status] || 'border-gray-300 dark:border-gray-700';
        },
        
        formatTime(timestamp) {
            if (!timestamp) return 'Unknown';
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        }
    };
}
</script>
@endpush
@endsection
