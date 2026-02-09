<?php

namespace App\Http\View\Composers;

use Illuminate\View\View;

class AdminSidebarComposer
{
    /**
     * Bind data to the view.
     */
    public function compose(View $view): void
    {
        $data = [
            'pendingTopicsCount' => $this->getPendingTopicsCount(),
            'pendingSaccoMembers' => $this->getPendingSaccoMembers(),
            'pendingSaccoLoans' => $this->getPendingSaccoLoans(),
            'pendingStoreOrders' => $this->getPendingStoreOrders(),
            'pendingLabelApplications' => $this->getPendingLabelApplications(),
            'systemHealthScore' => $this->getSystemHealthScore(),
        ];

        $view->with($data);
    }

    /**
     * Get pending forum topics count
     */
    protected function getPendingTopicsCount(): int
    {
        try {
            if (!config('modules.forum.enabled', false)) {
                return 0;
            }

            $forumTopicClass = \App\Models\Modules\Forum\ForumTopic::class;
            
            if (!class_exists($forumTopicClass)) {
                return 0;
            }

            return $forumTopicClass::where('status', 'pending')->count();
        } catch (\Exception $e) {
            \Log::warning('Failed to get pending topics count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get pending SACCO members count
     */
    protected function getPendingSaccoMembers(): int
    {
        try {
            if (!config('sacco.enabled', false)) {
                return 0;
            }

            $saccoMemberClass = \App\Modules\Sacco\Models\SaccoMember::class;
            
            if (!class_exists($saccoMemberClass)) {
                return 0;
            }

            return $saccoMemberClass::where('status', 'pending')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get pending SACCO loans count
     */
    protected function getPendingSaccoLoans(): int
    {
        try {
            if (!config('sacco.enabled', false)) {
                return 0;
            }

            $saccoLoanClass = \App\Modules\Sacco\Models\SaccoLoan::class;
            
            if (!class_exists($saccoLoanClass)) {
                return 0;
            }

            return $saccoLoanClass::where('status', 'pending')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get pending store orders count
     */
    protected function getPendingStoreOrders(): int
    {
        try {
            if (!config('store.enabled', false)) {
                return 0;
            }

            $orderClass = \App\Modules\Store\Models\Order::class;
            
            if (!class_exists($orderClass)) {
                return 0;
            }

            return $orderClass::where('status', 'pending')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get system health score (cached)
     */
    protected function getSystemHealthScore(): int
    {
        try {
            return \Cache::remember('system_health_score', 300, function() {
                $service = app(\App\Services\SystemMonitoringService::class);
                $health = $service->getSystemHealth();
                return $health['overall_score'] ?? 0;
            });
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get pending label applications count
     */
    protected function getPendingLabelApplications(): int
    {
        try {
            return \App\Models\LabelApplication::where('status', 'pending')->count();
        } catch (\Exception $e) {
            return 0;
        }
    }
}
