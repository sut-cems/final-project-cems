import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Trash2, FileText, CheckCircle, AlertCircle, RefreshCw, Loader2, Timer, Hourglass, Calendar, Clock, Star, Users, BarChart, ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { API_BASE_URL, deleteReport, downloadReport, downloadReportFile, generateReports } from '../../services/http';
import { DeleteConfirmationModal, ToastNotification } from '../Modal/DeleteButtonModal';
import { CustomReportBuilder, ModernSelect, QuickReports, type ReportRequest } from './ReportCreate';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
// Types
interface ReportListItem {
    id: string;
    name: string;
    type: string;
    status: string;
    file_url: string;
    generated_at: string;
    user_id: number;
}

export interface ReportListResponse {
    reports: ReportListItem[];
    total: number;
    page: number;
    limit: number;
}

interface FilterState {
    search: string;
    type: string;
    status: string;
    period: string;
}

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ size = 6, className = '' }) => (
    <Loader2 className={`animate-spin w-${size} h-${size} ${className}`} />
);

export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div className="flex-1">
            <p className="text-red-700">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-red-600 hover:text-red-800 underline text-sm mt-1"
                >
                    ลองใหม่
                </button>
            )}
        </div>
    </div>
);

async function fetchReportList(page: number = 1, limit: number = 10, filters?: FilterState): Promise<ReportListResponse> {
    const url = new URL(`${API_BASE_URL}/reports`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());

    if (filters) {
        if (filters.search?.trim()) url.searchParams.append('search', filters.search.trim());
        if (filters.type) url.searchParams.append('type', filters.type);
        if (filters.status) url.searchParams.append('status', filters.status);
        if (filters.period?.trim()) url.searchParams.append('period', filters.period.trim().toLowerCase()); // ✅ สำคัญ!
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ไม่สามารถดึงข้อมูลรายงานได้`);
    }

    const data = await response.json();
    return {
        reports: data.reports || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit
    };
}


const ReportsManagemet: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'create' | 'allReports'>('allReports');
    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [filteredReports, setFilteredReports] = useState<ReportListItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalFilteredReports, setTotalFilteredReports] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        type: '',
        status: '',
        period: ''
    });
    const itemsPerPage = 10;
    const [totalAllReports, setTotalAllReports] = useState(0);
    const debouncedSearchTerm = useDebounce(filters.search, 500);
    const [viewModal, setViewModal] = useState({
        isOpen: false,
        reportId: '',
        reportName: '',
        loading: false,
        pdfUrl: ''
    });
    const loadReports = useCallback(async (page: number = 1, currentFilters?: FilterState) => {
        try {
            setLoading(true);
            setError(null);

            const filtersToUse = currentFilters || {
                ...filters,
                search: debouncedSearchTerm
            };

            const response = await fetchReportList(page, itemsPerPage, filtersToUse);

            setReports(response.reports);

            const actualTotal = response.total > 0 ? response.total : response.reports.length;
            const actualTotalPages = Math.ceil(actualTotal / itemsPerPage);

            setTotalFilteredReports(actualTotal);
            setTotalPages(actualTotalPages);
            setCurrentPage(response.page);

            if (page === 1 && !filtersToUse.search && !filtersToUse.type && !filtersToUse.status && !filtersToUse.period) {
                setTotalAllReports(actualTotal);
            } else if (totalAllReports === 0) {
                try {
                    const allReportsResponse = await fetchReportList(1, 100, {
                        search: '', type: '', status: '', period: ''
                    });
                    const allTotal = allReportsResponse.total > 0 ? allReportsResponse.total : allReportsResponse.reports.length;
                    setTotalAllReports(allTotal);
                } catch (err) {
                    setTotalAllReports(actualTotal);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, filters, itemsPerPage, totalAllReports]);


    useEffect(() => {
        const effectiveFilters = {
            ...filters,
            search: debouncedSearchTerm
        };

        loadReports(1, effectiveFilters);
    }, [debouncedSearchTerm, filters.type, filters.status, filters.period]); 

    useEffect(() => {
        setFilteredReports(reports);
        setSelectedItems(new Set());
    }, [reports]);

    const stats = {
        total: totalAllReports,
        pending: reports.filter(r => r.status === 'pending').length,
        processing: reports.filter(r => r.status === 'processing').length,
        completed: reports.filter(r => r.status === 'completed').length,
        error: reports.filter(r => r.status === 'error').length
    };
    const displayTotal = Math.max(totalFilteredReports, reports.length);

    const getStatusDisplay = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'completed': 'เสร็จสิ้น',
            'processing': 'กำลังประมวลผล',
            'error': 'ผิดพลาด',
            'pending': 'รอดำเนินการ'
        };
        return statusMap[status] || status;
    };


    const getTypeDisplay = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'activity_summary': 'รายงานสรุปกิจกรรม',
            'club_ranking': 'รายงานอันดับชมรมจาการจัดกิจกรรม',
            'club_performance': 'รายงานประสิทธิภาพของชมรม',
            'category_analytics': 'รายงานวิเคราะห์กิจกรรมตามหมวดหมู่',
            'student_hours': 'รายงานชั่วโมงกิจกรรม'
        };
        return typeMap[type] || type;
    };

    // Status badge component
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
        const badges: { [key: string]: string } = {
            completed: 'bg-green-100 text-green-800',
            processing: 'bg-yellow-100 text-yellow-800',
            error: 'bg-red-100 text-red-800',
            pending: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
                {getStatusDisplay(status)}
            </span>
        );
    };

    const handleCheckboxChange = (reportId: string, checked: boolean) => {
        const newSelected = new Set(selectedItems);
        if (checked) {
            newSelected.add(reportId);
        } else {
            newSelected.delete(reportId);
        }
        setSelectedItems(newSelected);
    };

    const [bulkDeleteModal, setBulkDeleteModal] = useState({
        isOpen: false,
        selectedCount: 0
    });

    const handleBulkDelete = () => {
        setBulkDeleteModal({
            isOpen: true,
            selectedCount: selectedItems.size
        });
    };

    const confirmBulkDelete = async () => {
        try {
            for (const id of selectedItems) {
                await deleteReport(id);
            }
            setSelectedItems(new Set());
            setBulkDeleteModal({ isOpen: false, selectedCount: 0 });
            await loadReports();
            setToast({
                isVisible: true,
                message: 'ลบรายงานที่เลือกเรียบร้อยแล้ว',
                type: 'success'
            });
        } catch (error) {
            setToast({
                isVisible: true,
                message: `เกิดข้อผิดพลาดในการลบรายงาน: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    const closeBulkDeleteModal = () => {
        setBulkDeleteModal({ isOpen: false, selectedCount: 0 });
    };


    const handleBulkDownload = () => {
        setBulkDownloadModal({
            isOpen: true,
            selectedCount: selectedItems.size,
            downloading: false,
            progress: 0,
            currentFile: '',
            completed: 0,
            errors: []
        });
    };

    // เพิ่ม function สำหรับยืนยันการดาวน์โหลด
    const confirmBulkDownload = async () => {
        setBulkDownloadModal(prev => ({
            ...prev,
            downloading: true,
            progress: 0,
            currentFile: '',
            completed: 0,
            errors: []
        }));

        let completed = 0;
        const errors: string[] = [];
        const totalFiles = selectedItems.size;

        for (const id of selectedItems) {
            const report = reports.find(r => r.id === id);
            if (report && report.status === 'completed') {
                try {
                    // อัพเดต current file
                    setBulkDownloadModal(prev => ({
                        ...prev,
                        currentFile: report.name
                    }));

                    await downloadReportFile(id, `${report.name}.pdf`);
                    completed++;

                    // อัพเดต progress
                    const progress = (completed / totalFiles) * 100;
                    setBulkDownloadModal(prev => ({
                        ...prev,
                        completed,
                        progress
                    }));

                    // หน่วงเวลาเล็กน้อย
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    errors.push(`${report.name}: ${(error as Error).message}`);
                    setBulkDownloadModal(prev => ({
                        ...prev,
                        errors: [...prev.errors, `${report.name}: ${(error as Error).message}`]
                    }));
                }
            } else if (report && report.status !== 'completed') {
                errors.push(`${report.name}: รายงานยังไม่เสร็จสิ้น`);
                setBulkDownloadModal(prev => ({
                    ...prev,
                    errors: [...prev.errors, `${report.name}: รายงานยังไม่เสร็จสิ้น`]
                }));
            }
        }

        // แสดงผลสรุป
        setBulkDownloadModal(prev => ({
            ...prev,
            currentFile: '',
            progress: 100
        }));

        // แสดง toast notification
        if (completed > 0 && errors.length === 0) {
            setToast({
                isVisible: true,
                message: `ดาวน์โหลดรายงาน ${completed} รายการเรียบร้อยแล้ว`,
                type: 'success'
            });
        } else if (completed > 0 && errors.length > 0) {
            setToast({
                isVisible: true,
                message: `ดาวน์โหลดสำเร็จ ${completed} รายการ, ผิดพลาด ${errors.length} รายการ`,
                type: 'info'
            });
        } else if (errors.length > 0) {
            setToast({
                isVisible: true,
                message: `เกิดข้อผิดพลาดในการดาวน์โหลดทั้งหมด`,
                type: 'error'
            });
        }

        setSelectedItems(new Set());
    };

    const closeBulkDownloadModal = () => {
        setBulkDownloadModal({
            isOpen: false,
            selectedCount: 0,
            downloading: false,
            progress: 0,
            currentFile: '',
            completed: 0,
            errors: []
        });
    };

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        reportId: '',
        reportName: '',
        isProcessing: false
    });
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'info' as 'success' | 'error' | 'info'
    });
    const handleDownloadReport = async (id: string, name: string) => {
        try {
            await downloadReportFile(id, `${name}.pdf`);
        } catch (error) {
            alert(`เกิดข้อผิดพลาดในการดาวน์โหลด: ${(error as Error).message}`);
        }
    };
    // เพิ่ม state สำหรับ bulk download modal
    const [bulkDownloadModal, setBulkDownloadModal] = useState({
        isOpen: false,
        selectedCount: 0,
        downloading: false,
        progress: 0,
        currentFile: '',
        completed: 0,
        errors: [] as string[]
    });

    const BulkDownloadModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        selectedCount: number;
        downloading: boolean;
        progress: number;
        currentFile: string;
        completed: number;
        errors: string[];
        onConfirm: () => void;
    }> = ({
        isOpen,
        onClose,
        selectedCount,
        downloading,
        progress,
        currentFile,
        completed,
        errors,
        onConfirm
    }) => {
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-xl border border-white/20">

                        {/* Header Section - ใช้สีจากธีม */}
                        <div className="p-6 border-b border-gray-100/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#640D5F] to-[#D91656] flex items-center justify-center">
                                    <Download className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {downloading ? 'กำลังดาวน์โหลด' : 'ยืนยันการดาวน์โหลด'}
                                </h3>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6">
                            {!downloading ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#EB5B00] to-[#FFB200] flex items-center justify-center mx-auto">
                                        <Download className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-800 font-medium mb-2">
                                            ดาวน์โหลด {selectedCount} รายการ
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            ไฟล์จะถูกดาวน์โหลดทีละไฟล์ตามลำดับ
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Modern Progress Section */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {completed}/{selectedCount} ไฟล์
                                            </span>
                                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>

                                        {/* Sleek Progress Bar */}
                                        <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#640D5F] via-[#D91656] to-[#EB5B00] transition-all duration-500 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Current File Card */}
                                    {currentFile && (
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#640D5F] to-[#D91656] flex items-center justify-center flex-shrink-0">
                                                <LoadingSpinner size={4} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                    กำลังดาวน์โหลด
                                                </p>
                                                <p className="text-sm text-gray-800 truncate font-medium">
                                                    {currentFile}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Messages */}
                                    {errors.length > 0 && (
                                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0"></div>
                                                <p className="text-sm font-medium text-red-800">
                                                    พบข้อผิดพลาด ({errors.length})
                                                </p>
                                            </div>
                                            <div className="max-h-20 overflow-y-auto space-y-1">
                                                {errors.map((error, index) => (
                                                    <p key={index} className="text-xs text-red-600 pl-6">
                                                        {error}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-gray-100/50">
                            {!downloading ? (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#640D5F] to-[#D91656] text-white rounded-2xl hover:from-[#7a1070] hover:to-[#e61a61] transition-all duration-200 text-sm font-medium shadow-lg shadow-purple-500/25"
                                    >
                                        เริ่มดาวน์โหลด
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={onClose}
                                    disabled={progress < 100}
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {progress < 100 ? 'กำลังดาวน์โหลด...' : 'ปิด'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        };


    const handleDeleteReport = (id: string, name: string, status: string) => {
        setDeleteModal({
            isOpen: true,
            reportId: id,
            reportName: name,
            isProcessing: status === 'processing'
        });
    };

    // เพิ่ม function สำหรับยืนยันการลบ
    const confirmDeleteReport = async () => {
        try {
            await deleteReport(deleteModal.reportId);
            setDeleteModal({ isOpen: false, reportId: '', reportName: '', isProcessing: false });
            await loadReports();
            setToast({
                isVisible: true,
                message: deleteModal.isProcessing ? 'ยกเลิกการสร้างรายงานเรียบร้อยแล้ว' : 'ลบรายงานเรียบร้อยแล้ว',
                type: 'success'
            });
        } catch (error) {
            setToast({
                isVisible: true,
                message: `เกิดข้อผิดพลาด: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, reportId: '', reportName: '', isProcessing: false });
    };

    const closeToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Invalid Date";
            }
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            console.error("Error formatting date:", e);
            return "Invalid Date";
        }
    };


    const allCurrentPageSelected = filteredReports.length > 0 && filteredReports.every(item => selectedItems.has(item.id));
    const someCurrentPageSelected = filteredReports.some(item => selectedItems.has(item.id)) && !allCurrentPageSelected;

    function handleSelectAll(checked: boolean): void {
        if (checked) {
            const ids = filteredReports.map(r => r.id);
            setSelectedItems(new Set(ids));
        } else {
            setSelectedItems(new Set());
        }
    }

    const handleQuickReport = async (type: string) => {
        try {
            setLoading(true);
            const request: ReportRequest = {
                type,
                period: 'this_month',
                format: 'pdf',
                user_id: 1
            };
            await generateReports(request);
            loadReports();
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomReport = async (request: ReportRequest) => {
        try {
            setLoading(true);
            await generateReports(request);
            loadReports();
        } catch (error) {
            alert(`เกิดข้อผิดพลาด: ${(error as Error).message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = async (id: string, name: string) => {
        setViewModal({
            isOpen: true,
            reportId: id,
            reportName: name,
            loading: true,
            pdfUrl: ''
        });

        try {
            const blob = await downloadReport(id);
            const pdfUrl = URL.createObjectURL(blob);
            setViewModal(prev => ({
                ...prev,
                loading: false,
                pdfUrl: pdfUrl
            }));
        } catch (error) {
            setToast({
                isVisible: true,
                message: `เกิดข้อผิดพลาดในการเปิดรายงาน: ${(error as Error).message}`,
                type: 'error'
            });
            setViewModal(prev => ({ ...prev, isOpen: false, loading: false }));
        }
    };

    const closeViewModal = () => {
        if (viewModal.pdfUrl) {
            URL.revokeObjectURL(viewModal.pdfUrl);
        }
        setViewModal({
            isOpen: false,
            reportId: '',
            reportName: '',
            loading: false,
            pdfUrl: ''
        });
    };
    const ReportViewModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        reportName: string;
        pdfUrl: string;
        loading: boolean;
    }> = ({ isOpen, onClose, reportName, pdfUrl, loading }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-6 border-b">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {reportName}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="flex-1 p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner size={8} />
                                <span className="ml-2 text-gray-600">กำลังโหลดรายงาน...</span>
                            </div>
                        ) : pdfUrl ? (
                            <iframe
                                src={pdfUrl}
                                className="w-full h-full border border-gray-300 rounded"
                                title={`รายงาน: ${reportName}`}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">ไม่สามารถแสดงรายงานได้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <>
            <div className="bg-white min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">การจัดการรายงาน</h1>
                            <p className="text-sm text-gray-500">จัดการรายงานของคุณ</p>
                        </div>

                        {/* Modern Minimal Refresh Button */}
                        <button
                            onClick={() => loadReports()}
                            className="group relative bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:border-[#640D5F]/30 hover:bg-[#640D5F]/5 hover:text-[#640D5F] transition-all duration-300 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                            <span className="text-sm">รีเฟรช</span>

                            {/* Subtle glow effect on hover */}
                            <div className="absolute inset-0 rounded-xl bg-[#640D5F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-2 mb-8 p-1 bg-gray-50 rounded-full w-fit">
                        <button
                            className={`py-3 px-8 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'allReports'
                                ? 'bg-[#640D5F] text-white shadow-lg'
                                : 'text-gray-600 hover:text-[#640D5F] hover:bg-white'
                                }`}
                            onClick={() => setActiveTab('allReports')}
                        >
                            รายงานทั้งหมด
                        </button>
                        <button
                            className={`py-3 px-8 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'create'
                                ? 'bg-[#640D5F] text-white shadow-lg'
                                : 'text-gray-600 hover:text-[#640D5F] hover:bg-white'
                                }`}
                            onClick={() => setActiveTab('create')}
                        >
                            สร้างรายงาน
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'create' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <QuickReports onGenerateReport={handleQuickReport} loading={loading} />
                            <CustomReportBuilder onGenerateCustomReport={handleCustomReport} loading={loading} />
                        </div>
                    )}

                    {activeTab === 'allReports' && (
                        <div className="pb-8">
                            {/* Modern Stats Summary - Balanced Design */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                                <div className="group relative bg-white rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#640D5F]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-[#640D5F]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#640D5F] transition-colors duration-300">
                                            <FileText className="w-5 h-5 text-[#640D5F] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-2">รายงานทั้งหมด</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
                                        <div className="h-0.5 w-10 bg-[#640D5F] rounded-full"></div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                                            <Timer className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-2">รอดำเนินการ</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stats.pending}</p>
                                        <div className="h-0.5 w-10 bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#EB5B00]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-[#EB5B00]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#EB5B00] transition-colors duration-300">
                                            <Hourglass className="w-5 h-5 text-[#EB5B00] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-2">กำลังประมวลผล</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stats.processing}</p>
                                        <div className="h-0.5 w-10 bg-[#EB5B00] rounded-full"></div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFB200]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500 transition-colors duration-300">
                                            <CheckCircle className="w-5 h-5 text-green-500 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-2">เสร็จสิ้น</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stats.completed}</p>
                                        <div className="h-0.5 w-10 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-xl p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#D91656]/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-[#D91656]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#D91656] transition-colors duration-300">
                                            <AlertCircle className="w-5 h-5 text-[#D91656] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium mb-2">ผิดพลาด</p>
                                        <p className="text-2xl font-bold text-gray-900 mb-1">{stats.error}</p>
                                        <div className="h-0.5 w-10 bg-[#D91656] rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    {/* Modern Search Input */}
                                    <div>
                                        <label htmlFor="search-reports" className="block text-sm font-medium text-gray-700 mb-2">
                                            ค้นหารายงาน
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                id="search-reports"
                                                type="text"
                                                placeholder="ค้นหาด้วยชื่อรายงาน"
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                             hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 
                             focus:border-[#640D5F] transition-all duration-200 min-h-[48px]"
                                                value={filters.search}
                                                onChange={(e) => {
                                                    setFilters({ ...filters, search: e.target.value });
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            {/* Loading spinner for search */}
                                            {loading && filters.search && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <LoadingSpinner size={4} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Report Type Select */}
                                    <div>
                                        <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
                                            ประเภท
                                        </label>
                                        <ModernSelect
                                            options={[
                                                { value: "", label: "ทั้งหมด" },
                                                { value: "activity_summary", label: "รายงานสรุปกิจกรรม", icon: <FileText className="w-4 h-4" /> },
                                                { value: "club_ranking", label: "รายงานอันดับชมรมจาการจัดกิจกรรม", icon: <Clock className="w-4 h-4" /> },
                                                { value: "club_performance", label: "รายงานประสิทธิภาพของชมรม", icon: <Star className="w-4 h-4" /> },
                                                { value: "category_analytics", label: "รายงานวิเคราะห์กิจกรรมตามหมวดหมู่", icon: <Users className="w-4 h-4" /> },
                                                { value: "student_hours", label: "รายงานชั่วโมงสะสม", icon: <BarChart className="w-4 h-4" /> }
                                            ]}
                                            value={filters.type}
                                            onChange={(value) => setFilters({ ...filters, type: value })}
                                            placeholder="เลือกประเภท"
                                        />
                                    </div>

                                    {/* Report Status Select */}
                                    <div>
                                        <label htmlFor="report-status" className="block text-sm font-medium text-gray-700 mb-2">
                                            สถานะ
                                        </label>
                                        <ModernSelect
                                            options={[
                                                { value: "", label: "ทั้งหมด" },
                                                {
                                                    value: "completed",
                                                    label: "เสร็จสิ้น",
                                                    icon: <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                },
                                                {
                                                    value: "processing",
                                                    label: "กำลังประมวลผล",
                                                    icon: <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                },
                                                {
                                                    value: "error",
                                                    label: "ผิดพลาด",
                                                    icon: <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                },
                                                {
                                                    value: "pending",
                                                    label: "รอดำเนินการ",
                                                    icon: <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                                }
                                            ]}
                                            value={filters.status}
                                            onChange={(value) => setFilters({ ...filters, status: value })}
                                            placeholder="เลือกสถานะ"
                                        />
                                    </div>

                                    {/* Report Period Select */}
                                    <div>
                                        <label htmlFor="report-period" className="block text-sm font-medium text-gray-700 mb-2">
                                            ช่วงเวลา
                                        </label>
                                        <ModernSelect
                                            options={[
                                                { value: "", label: "ทั้งหมด" },
                                                { value: "today", label: "วันนี้" },
                                                { value: "this_week", label: "สัปดาห์นี้" },
                                                { value: "this_month", label: "เดือนนี้" },
                                                { value: "this_quarter", label: "ไตรมาสนี้" }
                                            ]}
                                            value={filters.period}
                                            onChange={(value) => setFilters({ ...filters, period: value })}
                                            placeholder="เลือกช่วงเวลา"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reports Table - from AllReports */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                                {/* Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <h3 className="text-xl font-bold text-gray-800">รายการรายงาน</h3>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                            <button
                                                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                                                disabled={selectedItems.size === 0}
                                                onClick={handleBulkDelete}
                                                aria-label="ลบรายการที่เลือก"
                                            >
                                                <Trash2 className="w-4 h-4 inline mr-1" />
                                                ลบที่เลือก ({selectedItems.size})
                                            </button>
                                            <button
                                                className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 text-sm"
                                                disabled={selectedItems.size === 0}
                                                onClick={handleBulkDownload}
                                                aria-label="ดาวน์โหลดรายการที่เลือก"
                                            >
                                                <Download className="w-4 h-4 inline mr-1" />
                                                ดาวน์โหลดที่เลือก ({selectedItems.size})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Select All */}
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            className="rounded text-purple-600 focus:ring-purple-500"
                                            checked={allCurrentPageSelected}
                                            ref={(input) => {
                                                if (input) input.indeterminate = someCurrentPageSelected;
                                            }}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            aria-label="เลือกทั้งหมด"
                                        />
                                        <label className="ml-2 text-sm text-gray-600">
                                            เลือกทั้งหมด ({selectedItems.size}/{reports.length})
                                        </label>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {loading ? (
                                    <div className="flex items-center justify-center p-8 h-48">
                                        <LoadingSpinner size={8} />
                                        <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
                                    </div>
                                ) : error ? (
                                    <div className="p-6">
                                        <ErrorMessage message={error} onRetry={() => loadReports(currentPage, filters)} />
                                    </div>
                                ) : (
                                    <>
                                        {/* Reports Cards */}
                                        <div className="p-6">
                                            {reports.length > 0 ? (
                                                <div className="grid gap-4">
                                                    {reports.map((report) => (
                                                        <div
                                                            key={report.id}
                                                            className={`p-6 border rounded-xl transition-all duration-200 hover:shadow-md ${selectedItems.has(report.id)
                                                                ? 'border-purple-300 bg-purple-50 shadow-sm'
                                                                : 'border-gray-200 hover:border-purple-200'
                                                                }`}
                                                            onClick={() => {
                                                                if (report.status === 'completed') {
                                                                    handleViewReport(report.id, report.name);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                {/* Checkbox */}
                                                                <div className="flex-shrink-0 pt-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded text-purple-600 focus:ring-purple-500"
                                                                        checked={selectedItems.has(report.id)}
                                                                        onChange={(e) => handleCheckboxChange(report.id, e.target.checked)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        aria-label={`เลือกรายงาน ${report.name}`}
                                                                    />
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                                        {/* Left side - Report info */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                                                                                {report.name}
                                                                            </h4>

                                                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                                                                <div className="flex items-center gap-1">
                                                                                    <FileText className="w-4 h-4" />
                                                                                    <span>{getTypeDisplay(report.type)}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="w-4 h-4" />
                                                                                    <span>{formatDate(report.generated_at)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Right side - Status and actions */}
                                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                                            <StatusBadge status={report.status} />

                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    className="flex items-center gap-1 px-3 py-2 text-purple-600 hover:text-purple-800 text-sm font-medium disabled:opacity-50 hover:bg-purple-50 rounded-lg transition-colors"
                                                                                    disabled={report.status !== 'completed'}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDownloadReport(report.id, report.name);
                                                                                    }}
                                                                                    aria-label={`ดาวน์โหลด ${report.name}`}
                                                                                >
                                                                                    <Download className="w-4 h-4" />
                                                                                    <span className="hidden sm:inline">ดาวน์โหลด</span>
                                                                                </button>
                                                                                <button
                                                                                    className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteReport(report.id, report.name, report.status);
                                                                                    }}
                                                                                    aria-label={`ลบ ${report.name}`}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                    <span className="hidden sm:inline">ลบ</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500 text-lg">ไม่มีรายงานที่ตรงกับตัวกรอง</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pagination - Modern Vibrant Design */}
                                        {totalPages > 1 && filteredReports.length > 0 && (
                                            <div className="px-6 py-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50/30 backdrop-blur-sm">
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                                    {/* Results info - Enhanced */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-sm">
                                                            <span className="text-gray-600">แสดง </span>
                                                            <span className="px-2 py-1 bg-[#640D5F] text-white text-xs font-bold rounded-full">
                                                                {Math.min(((currentPage - 1) * itemsPerPage) + 1, displayTotal)}-{Math.min(currentPage * itemsPerPage, displayTotal)}
                                                            </span>
                                                            <span className="text-gray-600"> จาก </span>
                                                            <span className="px-2 py-1 bg-[#FFB200] text-white text-xs font-bold rounded-full">
                                                                {displayTotal}
                                                            </span>
                                                            <span className="text-gray-600"> รายงาน</span>
                                                        </div>
                                                    </div>

                                                    {/* Pagination controls - Vibrant & Interactive */}
                                                    <div className="flex items-center gap-3">
                                                        {/* Previous button */}
                                                        <button
                                                            className={`group relative flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-300 transform ${currentPage === 1 || loading
                                                                ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                : 'text-[#640D5F] bg-white border-[#640D5F] hover:bg-[#640D5F] hover:text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0'
                                                                }`}
                                                            onClick={() => loadReports(currentPage - 1, filters)}
                                                            disabled={currentPage === 1 || loading}
                                                        >
                                                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                                            ก่อนหน้า
                                                            {!(currentPage === 1 || loading) && (
                                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#640D5F] to-[#D91656] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                            )}
                                                        </button>

                                                        {/* Page numbers - Dynamic & Colorful */}
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
                                                            {(() => {
                                                                const maxVisiblePages = 5;
                                                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                                                                if (endPage - startPage + 1 < maxVisiblePages) {
                                                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                                                }

                                                                const pageNumbers = [];

                                                                // Add first page if not visible
                                                                if (startPage > 1) {
                                                                    pageNumbers.push(1);
                                                                    if (startPage > 2) {
                                                                        pageNumbers.push('...');
                                                                    }
                                                                }

                                                                // Add visible pages
                                                                for (let i = startPage; i <= endPage; i++) {
                                                                    pageNumbers.push(i);
                                                                }

                                                                // Add last page if not visible
                                                                if (endPage < totalPages) {
                                                                    if (endPage < totalPages - 1) {
                                                                        pageNumbers.push('...');
                                                                    }
                                                                    pageNumbers.push(totalPages);
                                                                }

                                                                return pageNumbers.map((page, index) => {
                                                                    if (page === '...') {
                                                                        return (
                                                                            <div key={`ellipsis-${index}`} className="flex items-center px-2">
                                                                                <MoreHorizontal className="w-4 h-4 text-[#640D5F] animate-pulse" />
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={page}
                                                                            className={`relative min-w-[44px] h-11 text-sm font-bold rounded-xl transition-all duration-300 transform ${page === currentPage
                                                                                ? 'bg-[#640D5F] text-white shadow-lg shadow-purple-500/30 scale-110 z-10'
                                                                                : 'text-gray-700 bg-white hover:bg-[#D91656] hover:text-white hover:shadow-md hover:shadow-pink-500/25 hover:scale-105 active:scale-95 border border-gray-200 hover:border-[#D91656]'
                                                                                }`}
                                                                            onClick={() => {
                                                                                if (typeof page === 'number') {
                                                                                    loadReports(page, filters);
                                                                                }
                                                                            }}
                                                                            disabled={loading}
                                                                        >
                                                                            {page}
                                                                            {page === currentPage && (
                                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFB200] rounded-full animate-pulse"></div>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>

                                                        {/* Next button */}
                                                        <button
                                                            className={`group relative flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-300 transform ${currentPage === totalPages || loading
                                                                ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                : 'text-[#640D5F] bg-white border-[#640D5F] hover:bg-[#640D5F] hover:text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0'
                                                                }`}
                                                            onClick={() => loadReports(currentPage + 1, filters)}
                                                            disabled={currentPage === totalPages || loading}
                                                        >
                                                            ถัดไป
                                                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                                            {!(currentPage === totalPages || loading) && (
                                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#640D5F] to-[#D91656] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer - Summary */}
                                        {reports.length > 0 && (
                                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                                                <div className="text-sm text-gray-600 text-center">
                                                    แสดงทั้งหมด {reports.length} รายงาน
                                                    {selectedItems.size > 0 && (
                                                        <span className="ml-2 text-purple-600 font-medium">
                                                            • เลือกแล้ว {selectedItems.size} รายการ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportViewModal
                isOpen={viewModal.isOpen}
                onClose={closeViewModal}
                reportName={viewModal.reportName}
                pdfUrl={viewModal.pdfUrl}
                loading={viewModal.loading}
            />

            <BulkDownloadModal
                isOpen={bulkDownloadModal.isOpen}
                onClose={closeBulkDownloadModal}
                selectedCount={bulkDownloadModal.selectedCount}
                downloading={bulkDownloadModal.downloading}
                progress={bulkDownloadModal.progress}
                currentFile={bulkDownloadModal.currentFile}
                completed={bulkDownloadModal.completed}
                errors={bulkDownloadModal.errors}
                onConfirm={confirmBulkDownload}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteReport}
                reportName={deleteModal.reportName}
                isProcessing={deleteModal.isProcessing}
            />

            <DeleteConfirmationModal
                isOpen={bulkDeleteModal.isOpen}
                onClose={closeBulkDeleteModal}
                onConfirm={confirmBulkDelete}
                reportName={`รายงาน ${bulkDeleteModal.selectedCount} รายการที่เลือก`}
                isProcessing={false}
            />

            <ToastNotification
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={closeToast}
            />
        </>
    );
};

export default ReportsManagemet;