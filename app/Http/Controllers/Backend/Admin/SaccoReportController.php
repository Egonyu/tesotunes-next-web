<?php

namespace App\Http\Controllers\Backend\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Sacco\Models\SaccoMember;
use App\Modules\Sacco\Models\SaccoLoan;
use App\Modules\Sacco\Models\SaccoAccount;
use App\Modules\Sacco\Models\SaccoTransaction;
use App\Modules\Sacco\Models\SaccoDividend;
use App\Modules\Sacco\Services\SaccoReportService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SaccoReportController extends Controller
{
    protected $reportService;

    public function __construct(SaccoReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Reports dashboard
     */
    public function index()
    {
        return view('backend.sacco.reports.index');
    }

    /**
     * Financial report
     */
    public function financial(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $report = $this->reportService->generateFinancialReport($startDate, $endDate);

        if ($request->format === 'pdf') {
            return $this->exportFinancialReportPdf($report, $startDate, $endDate);
        }

        if ($request->format === 'excel') {
            return $this->exportFinancialReportExcel($report, $startDate, $endDate);
        }

        return view('backend.sacco.reports.financial', compact('report', 'startDate', 'endDate'));
    }

    /**
     * Loans report
     */
    public function loans(Request $request)
    {
        $status = $request->input('status', 'all');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $report = $this->reportService->generateLoansReport($status, $startDate, $endDate);

        if ($request->format === 'pdf') {
            return $this->exportLoansReportPdf($report, $status, $startDate, $endDate);
        }

        if ($request->format === 'excel') {
            return $this->exportLoansReportExcel($report, $status, $startDate, $endDate);
        }

        return view('backend.sacco.reports.loans', compact('report', 'status', 'startDate', 'endDate'));
    }

    /**
     * Members report
     */
    public function members(Request $request)
    {
        $status = $request->input('status', 'all');
        
        $report = $this->reportService->generateMembersReport($status);

        if ($request->format === 'pdf') {
            return $this->exportMembersReportPdf($report, $status);
        }

        if ($request->format === 'excel') {
            return $this->exportMembersReportExcel($report, $status);
        }

        return view('backend.sacco.reports.members', compact('report', 'status'));
    }

    /**
     * Transactions report
     */
    public function transactions(Request $request)
    {
        $type = $request->input('type', 'all');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $report = $this->reportService->generateTransactionsReport($type, $startDate, $endDate);

        if ($request->format === 'pdf') {
            return $this->exportTransactionsReportPdf($report, $type, $startDate, $endDate);
        }

        if ($request->format === 'excel') {
            return $this->exportTransactionsReportExcel($report, $type, $startDate, $endDate);
        }

        return view('backend.sacco.reports.transactions', compact('report', 'type', 'startDate', 'endDate'));
    }

    /**
     * Savings report
     */
    public function savings(Request $request)
    {
        $report = $this->reportService->generateSavingsReport();

        if ($request->format === 'pdf') {
            return $this->exportSavingsReportPdf($report);
        }

        if ($request->format === 'excel') {
            return $this->exportSavingsReportExcel($report);
        }

        return view('backend.sacco.reports.savings', compact('report'));
    }

    /**
     * Shares report
     */
    public function shares(Request $request)
    {
        $report = $this->reportService->generateSharesReport();

        if ($request->format === 'pdf') {
            return $this->exportSharesReportPdf($report);
        }

        if ($request->format === 'excel') {
            return $this->exportSharesReportExcel($report);
        }

        return view('backend.sacco.reports.shares', compact('report'));
    }

    /**
     * Dividends report
     */
    public function dividends(Request $request)
    {
        $year = $request->input('year', now()->year);
        
        $report = $this->reportService->generateDividendsReport($year);

        if ($request->format === 'pdf') {
            return $this->exportDividendsReportPdf($report, $year);
        }

        if ($request->format === 'excel') {
            return $this->exportDividendsReportExcel($report, $year);
        }

        return view('backend.sacco.reports.dividends', compact('report', 'year'));
    }

    /**
     * Performance report
     */
    public function performance(Request $request)
    {
        $period = $request->input('period', 'monthly'); // daily, weekly, monthly, yearly
        $startDate = $request->input('start_date', now()->startOfYear());
        $endDate = $request->input('end_date', now()->endOfYear());

        $report = $this->reportService->generatePerformanceReport($period, $startDate, $endDate);

        if ($request->format === 'pdf') {
            return $this->exportPerformanceReportPdf($report, $period, $startDate, $endDate);
        }

        if ($request->format === 'excel') {
            return $this->exportPerformanceReportExcel($report, $period, $startDate, $endDate);
        }

        return view('backend.sacco.reports.performance', compact('report', 'period', 'startDate', 'endDate'));
    }

    /**
     * Audit report
     */
    public function audit(Request $request)
    {
        $action = $request->input('action', 'all');
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now()->endOfMonth());

        $report = $this->reportService->generateAuditReport($action, $startDate, $endDate);

        if ($request->format === 'pdf') {
            return $this->exportAuditReportPdf($report, $action, $startDate, $endDate);
        }

        if ($request->format === 'excel') {
            return $this->exportAuditReportExcel($report, $action, $startDate, $endDate);
        }

        return view('backend.sacco.reports.audit', compact('report', 'action', 'startDate', 'endDate'));
    }

    /**
     * Compliance report
     */
    public function compliance(Request $request)
    {
        $report = $this->reportService->generateComplianceReport();

        if ($request->format === 'pdf') {
            return $this->exportComplianceReportPdf($report);
        }

        if ($request->format === 'excel') {
            return $this->exportComplianceReportExcel($report);
        }

        return view('backend.sacco.reports.compliance', compact('report'));
    }

    /**
     * Generate custom report
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'report_type' => 'required|in:financial,loans,members,transactions,savings,shares,dividends,performance,audit,compliance',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'filters' => 'nullable|array',
            'format' => 'required|in:pdf,excel,csv',
        ]);

        // Generate report based on type
        $method = $validated['report_type'];
        return $this->$method($request);
    }

    /**
     * Export financial report as PDF
     */
    protected function exportFinancialReportPdf($report, $startDate, $endDate)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.financial', [
            'report' => $report,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-financial-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export loans report as PDF
     */
    protected function exportLoansReportPdf($report, $status, $startDate, $endDate)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.loans', [
            'report' => $report,
            'status' => $status,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-loans-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export members report as PDF
     */
    protected function exportMembersReportPdf($report, $status)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.members', [
            'report' => $report,
            'status' => $status,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-members-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export transactions report as PDF
     */
    protected function exportTransactionsReportPdf($report, $type, $startDate, $endDate)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.transactions', [
            'report' => $report,
            'type' => $type,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-transactions-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export savings report as PDF
     */
    protected function exportSavingsReportPdf($report)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.savings', [
            'report' => $report,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-savings-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export shares report as PDF
     */
    protected function exportSharesReportPdf($report)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.shares', [
            'report' => $report,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-shares-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export dividends report as PDF
     */
    protected function exportDividendsReportPdf($report, $year)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.dividends', [
            'report' => $report,
            'year' => $year,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-dividends-report-' . $year . '.pdf');
    }

    /**
     * Export performance report as PDF
     */
    protected function exportPerformanceReportPdf($report, $period, $startDate, $endDate)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.performance', [
            'report' => $report,
            'period' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-performance-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export audit report as PDF
     */
    protected function exportAuditReportPdf($report, $action, $startDate, $endDate)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.audit', [
            'report' => $report,
            'action' => $action,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-audit-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export compliance report as PDF
     */
    protected function exportComplianceReportPdf($report)
    {
        $pdf = \PDF::loadView('backend.sacco.reports.pdf.compliance', [
            'report' => $report,
            'generatedAt' => now(),
            'generatedBy' => auth()->user(),
        ]);

        return $pdf->download('sacco-compliance-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Export financial report as Excel
     */
    protected function exportFinancialReportExcel($report, $startDate, $endDate)
    {
        return (new \App\Exports\SaccoFinancialReportExport($report, $startDate, $endDate))
            ->download('sacco-financial-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export loans report as Excel
     */
    protected function exportLoansReportExcel($report, $status, $startDate, $endDate)
    {
        return (new \App\Exports\SaccoLoansReportExport($report, $status, $startDate, $endDate))
            ->download('sacco-loans-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export members report as Excel
     */
    protected function exportMembersReportExcel($report, $status)
    {
        return (new \App\Exports\SaccoMembersReportExport($report, $status))
            ->download('sacco-members-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export transactions report as Excel
     */
    protected function exportTransactionsReportExcel($report, $type, $startDate, $endDate)
    {
        return (new \App\Exports\SaccoTransactionsReportExport($report, $type, $startDate, $endDate))
            ->download('sacco-transactions-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export savings report as Excel
     */
    protected function exportSavingsReportExcel($report)
    {
        return (new \App\Exports\SaccoSavingsReportExport($report))
            ->download('sacco-savings-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export shares report as Excel
     */
    protected function exportSharesReportExcel($report)
    {
        return (new \App\Exports\SaccoSharesReportExport($report))
            ->download('sacco-shares-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export dividends report as Excel
     */
    protected function exportDividendsReportExcel($report, $year)
    {
        return (new \App\Exports\SaccoDividendsReportExport($report, $year))
            ->download('sacco-dividends-report-' . $year . '.xlsx');
    }

    /**
     * Export performance report as Excel
     */
    protected function exportPerformanceReportExcel($report, $period, $startDate, $endDate)
    {
        return (new \App\Exports\SaccoPerformanceReportExport($report, $period, $startDate, $endDate))
            ->download('sacco-performance-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export audit report as Excel
     */
    protected function exportAuditReportExcel($report, $action, $startDate, $endDate)
    {
        return (new \App\Exports\SaccoAuditReportExport($report, $action, $startDate, $endDate))
            ->download('sacco-audit-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Export compliance report as Excel
     */
    protected function exportComplianceReportExcel($report)
    {
        return (new \App\Exports\SaccoComplianceReportExport($report))
            ->download('sacco-compliance-report-' . now()->format('Y-m-d') . '.xlsx');
    }
}
