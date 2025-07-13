import { AlertCircle, BarChart3, Calendar, Check, ChevronDown, Clock, FilePlus, FilePlus2, FileText, Loader2, PieChart, Search, Settings, Trophy, Zap } from "lucide-react";
import { LoadingSpinner } from "./ReportsDashboard";
import { TooltipCustom } from "../Home/ProfileDropdown";
import React, { useCallback, useEffect, useState } from "react";
import { API_BASE_URL, flexibleUserSearch } from "../../services/http";
import { ToastNotification } from "../Modal/DeleteButtonModal";

export interface ReportRequest {
    type: string;
    period: string;
    start_date?: string;
    end_date?: string;
    club_id?: number;
    format: string;
    user_id: number;
}
interface SelectOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface ModernSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    searchable?: boolean;
    onSearch?: (keyword: string) => void;
    loading?: boolean;
    noOptionsMessage?: string;
}

export interface ClubStatus {
    id: number;
    name: string;
    is_active: boolean;
}

export interface ClubCategory {
    id: number;
    name: string;
}

export interface Club {
    id: number;
    name: string;
    description: string;
    logo_image?: string;
    member_count: number;
    status: ClubStatus;
    category: ClubCategory;
}

export interface ClubsResponse {
    success: boolean;
    data: Club[];
    total: number;
    page: number;
    limit: number;
}

export interface ClubsQueryParams {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
}
const fetchClubs = async (params: ClubsQueryParams = {}): Promise<ClubsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/clubs?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const ModernSelect: React.FC<ModernSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "เลือกตัวเลือก",
    className = "",
    disabled = false,
    searchable = false,
    onSearch,
    loading = false,
    noOptionsMessage = 'ไม่พบตัวเลือก',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSearch, setInternalSearch] = useState('');
    const selectedOption = options.find(option => option.value === value);

    const truncateText = (text: string, maxLength: number = 25) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    useEffect(() => {
        if (!searchable) return;
        const t = setTimeout(() => {
            onSearch?.(internalSearch.trim());
        }, 300);
        return () => clearTimeout(t);
    }, [internalSearch, searchable, onSearch]);

    // Filter options based on search when no external search handler
    const filteredOptions = searchable && !onSearch
        ? options.filter(option =>
            option.label.toLowerCase().includes(internalSearch.toLowerCase())
        )
        : options;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-xl
                    hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F]
                    transition-all duration-300 ease-out flex items-center justify-between
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:shadow-sm'}
                    ${isOpen ? 'border-[#640D5F] ring-2 ring-[#640D5F]/20 shadow-sm' : ''}
                    min-h-[52px] h-auto shadow-sm
                `}
            >
                <div className="flex items-center flex-1 min-w-0 pr-3 overflow-hidden">
                    {selectedOption?.icon && (
                        <span className="mr-3 flex-shrink-0 text-gray-600">{selectedOption.icon}</span>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        {selectedOption && selectedOption.label.length > 25 ? (
                            <TooltipCustom
                                text={selectedOption.label}
                                position="top"
                            >
                                <div className="cursor-pointer overflow-hidden">
                                    <span className="block text-gray-900 text-sm font-medium leading-snug truncate">
                                        {truncateText(selectedOption.label, 25)}
                                    </span>
                                </div>
                            </TooltipCustom>
                        ) : (
                            <div className="overflow-hidden">
                                <span className={`block text-sm font-medium leading-snug truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                    {selectedOption ? selectedOption.label : placeholder}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-all duration-300 ease-out flex-shrink-0 ${isOpen ? 'transform rotate-180 text-[#640D5F]' : ''
                        }`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden backdrop-blur-sm">
                        {searchable && (
                            <div className="p-3 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาตัวเลือก..."
                                        value={internalSearch}
                                        onChange={(e) => setInternalSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#640D5F]/20 focus:border-[#640D5F] transition-all duration-300 ease-out text-sm"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-5 h-5 text-[#640D5F] animate-spin" />
                                    <span className="ml-2 text-sm text-gray-500">กำลังโหลด...</span>
                                </div>
                            ) : filteredOptions.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 text-sm">
                                    {noOptionsMessage}
                                </div>
                            ) : (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setInternalSearch('');
                                        }}
                                        className={`
                                            w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 ease-out
                                            flex items-center justify-between group min-h-[52px] relative
                                            ${value === option.value ? 'bg-[#640D5F]/5 text-[#640D5F] border-l-2 border-l-[#640D5F]' : 'text-gray-900 hover:text-gray-700'}
                                            ${index === 0 ? '' : 'border-t border-gray-100'}
                                            hover:shadow-sm
                                        `}
                                    >
                                        <div className="flex items-center flex-1 min-w-0 pr-3">
                                            {option.icon && (
                                                <span className={`mr-3 flex-shrink-0 transition-colors duration-200 ${value === option.value ? 'text-[#640D5F]' : 'text-gray-600'
                                                    }`}>
                                                    {option.icon}
                                                </span>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {option.label.length > 50 ? (
                                                    <TooltipCustom
                                                        text={option.label}
                                                        position="left"
                                                    >
                                                        <span className="block text-sm font-medium leading-relaxed cursor-pointer overflow-hidden">
                                                            <span className="block">
                                                                {option.label.split(' ').reduce((acc, word) => {
                                                                    const currentLine = acc[acc.length - 1];
                                                                    if (currentLine && (currentLine + ' ' + word).length <= 50) {
                                                                        acc[acc.length - 1] = currentLine + ' ' + word;
                                                                    } else {
                                                                        acc.push(word);
                                                                    }
                                                                    return acc;
                                                                }, [] as string[]).slice(0, 2).map((line, lineIndex) => (
                                                                    <span key={lineIndex} className="block">
                                                                        {lineIndex === 1 && option.label.split(' ').length > 2 ?
                                                                            line + '...' : line
                                                                        }
                                                                    </span>
                                                                ))}
                                                            </span>
                                                        </span>
                                                    </TooltipCustom>
                                                ) : (
                                                    <span className="block text-sm font-medium leading-relaxed overflow-hidden">
                                                        <span className="block whitespace-normal break-words">
                                                            {option.label}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {value === option.value && (
                                            <Check className="w-4 h-4 text-[#640D5F] flex-shrink-0 opacity-80" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
// UserSelect.tsx ---------------------------
type Option = { value: string; label: string };

export const UserSelect: React.FC<{
    value: string;
    onChange: (v: string) => void;
    className?: string;
}> = ({ value, onChange, className }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);

    // UserSelect.tsx
    const handleSearch = async (keyword: string) => {
        const kw = keyword.trim();
        if (!kw) return;            // <-- แค่ตัดท่อนนี้พอ
        setLoading(true);
        try {
            const users = await flexibleUserSearch(kw);
            setOptions(users.map(u => ({
                value: u.ID.toString(),
                label: `${u.FirstName} ${u.LastName} (${u.StudentID})`,
            })));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModernSelect
            searchable
            options={options}
            loading={loading}
            value={value}
            onChange={onChange}
            onSearch={handleSearch}
            placeholder="ค้นหานักศึกษา..."
            noOptionsMessage="ไม่พบนักศึกษา"
            className={className}
        />
    );
};


const useClubs = (params: ClubsQueryParams = {}) => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const loadClubs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchClubs(params);
            setClubs(response.data);
            setTotal(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลชมรม');
        } finally {
            setLoading(false);
        }
    }, [params.page, params.limit, params.category, params.search]);

    useEffect(() => {
        loadClubs();
    }, [loadClubs]);

    return { clubs, loading, error, total, refetch: loadClubs };
};


// Quick Reports Component with Toast Integration
interface QuickReportsProps {
    onGenerateReport: (type: string) => Promise<void>;
    loading: boolean;
}

const QuickReports: React.FC<QuickReportsProps> = ({ onGenerateReport, loading }) => {
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "info" | "error" | "success"; title: string }>({ isVisible: false, message: '', type: 'info', title: '' });

    const reports = [
        {
            name: 'รายงานสรุปกิจกรรม',
            type: 'activity_summary',
            color: 'bg-[#FFB200]',
            icon: <FileText className="w-5 h-5" />
        },
        {
            name: 'รายงานวิเคราะห์กิจกรรมตามหมวดหมู่',
            type: 'category_analytics',
            color: 'bg-[#640D5F]',
            icon: <PieChart className="w-5 h-5" />
        },
        {
            name: 'รายงานชั่วโมงกิจกรรม',
            type: 'student_hours',
            color: 'bg-[#EB5B00]',
            icon: <Clock className="w-5 h-5" />
        },
        {
            name: 'รายงานอันดับชมรมจาการจัดกิจกรรม',
            type: 'club_ranking',
            color: 'bg-[#D91656]',
            icon: <Trophy className="w-5 h-5" />
        }
    ];

    interface Report {
        name: string;
        type: string;
        color: string;
        icon: React.ReactElement;
    }

    const handleGenerateReport = async (type: string): Promise<void> => {
        const reportName = reports.find((r: Report) => r.type === type)?.name || 'รายงาน';

        try {
            setToast({
                isVisible: true,
                type: 'info',
                title: 'กำลังสร้างรายงาน',
                message: `กำลังสร้าง${reportName}...`
            });

            await onGenerateReport(type);

            setToast({
                isVisible: true,
                type: 'success',
                title: 'สร้างรายงานสำเร็จ',
                message: `${reportName}ถูกสร้างเรียบร้อยแล้ว`
            });
        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                title: 'เกิดข้อผิดพลาด',
                message: `ไม่สามารถสร้าง${reportName}ได้ กรุณาลองใหม่อีกครั้ง`
            });
        }
    };

    const closeToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">รายงานด่วน</h3>
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    {reports.map((report, index) => (
                        <button
                            key={index}
                            onClick={() => handleGenerateReport(report.type)}
                            disabled={loading}
                            className="group w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${report.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    {React.cloneElement(report.icon, { className: "w-4 h-4 text-white" })}
                                </div>
                                <span className="font-medium text-gray-700 text-left">{report.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {loading ? (
                                    <LoadingSpinner size={16} className="text-gray-400" />
                                ) : (
                                    <FilePlus2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Toast Notification */}
            <ToastNotification
                message={toast.message}
                type={toast.type}
                title={toast.title}
                isVisible={toast.isVisible}
                onClose={closeToast}
                duration={toast.type === 'info' ? 2000 : 4000}
                position="top-right"
            />
        </>
    );
};

// Custom Report Builder with Toast Integration
interface CustomReportBuilderProps {
    onGenerateCustomReport: (request: ReportRequest) => Promise<void>;
    loading: boolean;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ onGenerateCustomReport, loading }) => {
    const [reportType, setReportType] = useState('activity_summary');
    const [timePeriod, setTimePeriod] = useState('this_month');
    const [organization, setOrganization] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "info" | "success" | "error"; title: string }>({ isVisible: false, message: '', type: 'info', title: '' });

    const { clubs, loading: clubsLoading, error: clubsError } = useClubs({
        limit: 100
    });

    const reportTypeOptions = [
        { value: 'activity_summary', label: 'รายงานสรุปกิจกรรม', icon: <FileText className="w-4 h-4" /> },
        { value: 'club_ranking', label: 'รายงานอันดับชมรมจาการจัดกิจกรรม', icon: <Trophy className="w-4 h-4" /> },
        { value: 'club_performance', label: 'รายงานประสิทธิภาพของชมรม', icon: <BarChart3 className="w-4 h-4" /> },
        { value: 'category_analytics', label: 'รายงานวิเคราะห์กิจกรรมตามหมวดหมู่', icon: <PieChart className="w-4 h-4" /> },
        { value: 'student_hours', label: 'รายงานชั่วโมงสะสม', icon: <Clock className="w-4 h-4" /> }
    ];

    const timePeriodOptions = [
        { value: 'week', label: 'สัปดาห์นี้' },
        { value: 'this_month', label: 'เดือนนี้' },
        { value: 'this_quarter', label: 'ไตรมาสนี้' },
        { value: 'this_year', label: 'ปีการศึกษานี้' },
        { value: 'custom', label: 'กำหนดเอง' }
    ];

    const organizationOptions = clubs.map(club => ({
        value: club.id.toString(),
        label: club.name,
    }));


    const handleGenerate = async () => {
        const reportName = reportTypeOptions.find(r => r.value === reportType)?.label || 'รายงาน';

        const request = {
            type: reportType,
            period: timePeriod,
            format: 'pdf',
            user_id: reportType === 'student_hours' && selectedUserId ? parseInt(selectedUserId) : 1,
            ...(reportType === 'club_performance' && organization && {
                club_id: parseInt(organization)
            }),
            ...(timePeriod === 'custom' && {
                start_date: startDate,
                end_date: endDate
            })
        };

        try {
            setToast({
                isVisible: true,
                type: 'info',
                title: 'กำลังสร้างรายงาน',
                message: `กำลังสร้าง${reportName}...`
            });

            await onGenerateCustomReport(request);

            setToast({
                isVisible: true,
                type: 'success',
                title: 'สร้างรายงานสำเร็จ',
                message: `${reportName}ถูกสร้างเรียบร้อยแล้ว`
            });

            setReportType('activity_summary');
            setTimePeriod('this_month');
            setOrganization('');
            setSelectedUserId('');
            setStartDate('');
            setEndDate('');

        } catch (error) {
            setToast({
                isVisible: true,
                type: 'error',
                title: 'เกิดข้อผิดพลาด',
                message: `ไม่สามารถสร้าง${reportName}ได้ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง`
            });
        }
    };

    const closeToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const isCustomPeriod = timePeriod === 'custom';
    const showClubSelection = reportType === 'club_performance';
    const showUserSelection = reportType === 'student_hours';
    const isGenerateDisabled =
        loading || clubsLoading ||
        (isCustomPeriod && (!startDate || !endDate)) ||
        (showUserSelection && !selectedUserId) ||
        (isCustomPeriod && startDate && endDate && new Date(endDate) < new Date(startDate));

    return (
        <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">สร้างรายงานแบบกำหนดเอง</h3>
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Form Fields */}
                    <div className={`grid gap-4 ${(showClubSelection || showUserSelection) ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                ประเภทรายงาน
                            </label>
                            <ModernSelect
                                options={reportTypeOptions}
                                value={reportType}
                                onChange={(value) => {
                                    setReportType(value);
                                    if (value !== 'club_performance') {
                                        setOrganization('');
                                    }
                                    if (value !== 'student_hours') {
                                        setSelectedUserId('');
                                    }
                                }}
                                placeholder="เลือกประเภทรายงาน"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600">
                                ช่วงเวลา
                            </label>
                            <ModernSelect
                                options={timePeriodOptions}
                                value={timePeriod}
                                onChange={(value) => {
                                    setTimePeriod(value);
                                    if (value !== 'custom') {
                                        setStartDate('');
                                        setEndDate('');
                                    }
                                }}
                                placeholder="เลือกช่วงเวลา"
                                className="w-full"
                            />
                        </div>

                        {showClubSelection && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">
                                    <span>ชมรม</span>
                                    {clubsLoading && (
                                        <span className="ml-2 text-xs text-gray-400">
                                            (กำลังโหลด...)
                                        </span>
                                    )}
                                    {clubsError && (
                                        <span className="ml-2 text-xs text-red-400">
                                            (เกิดข้อผิดพลาด)
                                        </span>
                                    )}
                                </label>
                                <ModernSelect
                                    options={organizationOptions}
                                    value={organization}
                                    onChange={setOrganization}
                                    placeholder={clubsLoading ? "กำลังโหลดชมรม..." : "เลือกชมรม"}
                                    disabled={clubsLoading || !!clubsError}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {showUserSelection && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-600">นักศึกษา</label>
                                <UserSelect
                                    value={selectedUserId}
                                    onChange={setSelectedUserId}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Custom Date Range */}
                    {isCustomPeriod && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center mb-3">
                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                <h4 className="text-sm font-medium text-gray-700">กำหนดช่วงเวลา</h4>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-6 h-6 bg-[#640D5F] rounded-lg flex items-center justify-center mr-2">
                                            <Calendar className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">เริ่มต้น</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#640D5F] focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-gray-400"></div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <div className="w-6 h-6 bg-[#D91656] rounded-lg flex items-center justify-center mr-2">
                                            <Calendar className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">สิ้นสุด</span>
                                    </div>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-[#640D5F] focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Date validation message */}
                            {startDate && endDate && new Date(endDate) < new Date(startDate) && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Generate Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handleGenerate}
                            disabled={!!isGenerateDisabled}
                            className="w-full bg-[#640D5F] hover:bg-[#7a1070] text-white py-3 px-6 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {(loading || clubsLoading) ? (
                                <>
                                    <LoadingSpinner size={18} className="text-white" />
                                    <span>กำลังสร้างรายงาน...</span>
                                </>
                            ) : (
                                <>
                                    <FilePlus className="w-4 h-4" />
                                    <span>สร้างรายงาน</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            <ToastNotification
                message={toast.message}
                type={toast.type}
                title={toast.title}
                isVisible={toast.isVisible}
                onClose={closeToast}
                duration={toast.type === 'info' ? 2000 : 4000}
                position="top-right"
            />
        </>
    );
};

export { QuickReports, CustomReportBuilder };