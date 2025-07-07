import {Calendar, Check, ChevronDown, Clock, Download, FilePlus, Settings, Star, Users, Zap } from "lucide-react";
import { LoadingSpinner } from "./ReportsDashboard";
import { TooltipCustom } from "../Home/ProfileDropdown";
import React, { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/http";

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
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const selectedOption = options.find(option => option.value === value);
    
    const truncateText = (text: string, maxLength: number = 25) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
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
                                <span className={`block text-sm font-medium leading-snug truncate ${
                                    selectedOption ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {selectedOption ? selectedOption.label : placeholder}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-all duration-300 ease-out flex-shrink-0 ${
                        isOpen ? 'transform rotate-180 text-[#640D5F]' : ''
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
                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {options.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
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
                                            <span className={`mr-3 flex-shrink-0 transition-colors duration-200 ${
                                                value === option.value ? 'text-[#640D5F]' : 'text-gray-600'
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
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
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


// Quick Reports Component - Minimal Modern Design
const QuickReports: React.FC<{ onGenerateReport: (type: string) => void; loading: boolean }> = ({ onGenerateReport, loading }) => {
    const reports = [
        { 
            name: 'รายงานจำนวนผู้เข้าร่วม', 
            type: 'participation', 
            color: 'bg-[#640D5F]',
            icon: <Users className="w-5 h-5" />
        },
        { 
            name: 'รายงานชั่วโมงกิจกรรม', 
            type: 'hours', 
            color: 'bg-[#EB5B00]',
            icon: <Clock className="w-5 h-5" />
        },
        { 
            name: 'รายงานการประเมินกิจกรรม', 
            type: 'evaluation', 
            color: 'bg-[#D91656]',
            icon: <Star className="w-5 h-5" />
        },
        { 
            name: 'รายงานสรุปประจำเดือน', 
            type: 'summary', 
            color: 'bg-[#FFB200]',
            icon: <Calendar className="w-5 h-5" />
        }
    ];

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">รายงานด่วน</h3>
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Zap   className="w-4 h-4 text-gray-500" />
                </div>
            </div>
            
            <div className="space-y-3">
                {reports.map((report, index) => (
                    <button
                        key={index}
                        onClick={() => onGenerateReport(report.type)}
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
                                <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Custom Report Builder - Clean Minimal Design
const CustomReportBuilder: React.FC<{ onGenerateCustomReport: (request: ReportRequest) => void; loading: boolean }> = ({ onGenerateCustomReport, loading }) => {
    const [reportType, setReportType] = useState('participation');
    const [timePeriod, setTimePeriod] = useState('this_month');
    const [organization, setOrganization] = useState('');
    
    const { clubs, loading: clubsLoading, error: clubsError } = useClubs({ 
        limit: 100
    });

    const reportTypeOptions = [
        { value: 'participation', label: 'รายงานผู้เข้าร่วมกิจกรรม', icon: <Users className="w-4 h-4" /> },
        { value: 'hours', label: 'รายงานชั่วโมงสะสม', icon: <Clock className="w-4 h-4" /> },
        { value: 'evaluation', label: 'รายงานการประเมิน', icon: <Star className="w-4 h-4" /> },
        { value: 'summary', label: 'รายงานสถิติชมรม', icon: <Calendar className="w-4 h-4" /> }
    ];

    const timePeriodOptions = [
        { value: 'this_month', label: 'เดือนนี้' },
        { value: 'this_quarter', label: 'ไตรมาสนี้' },
        { value: 'this_year', label: 'ปีการศึกษานี้' },
        { value: 'custom', label: 'กำหนดเอง' }
    ];

    const organizationOptions = [
        { value: '', label: 'ทั้งหมด' },
        ...clubs.map(club => ({
            value: club.id.toString(),
            label: club.name,
        }))
    ];

    const handleGenerate = () => {
        const request: ReportRequest = {
            type: reportType,
            period: timePeriod,
            club_id: organization ? parseInt(organization) : undefined,
            format: 'pdf',
            user_id: 1
        };
        onGenerateCustomReport(request);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">สร้างรายงานแบบกำหนดเอง</h3>
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-500" />
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                            ประเภทรายงาน
                        </label>
                        <ModernSelect
                            options={reportTypeOptions}
                            value={reportType}
                            onChange={setReportType}
                            placeholder="เลือกประเภทรายงาน"
                            className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#640D5F]/10 focus:border-[#640D5F] transition-all"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                            ช่วงเวลา
                        </label>
                        <ModernSelect
                            options={timePeriodOptions}
                            value={timePeriod}
                            onChange={setTimePeriod}
                            placeholder="เลือกช่วงเวลา"
                            className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#640D5F]/10 focus:border-[#640D5F] transition-all"
                        />
                    </div>
                    
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
                            className="w-full p-3 rounded-xl focus:ring-2 focus:ring-[#640D5F]/10 focus:border-[#640D5F] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || clubsLoading}
                        className="w-full bg-[#640D5F] hover:bg-[#7a1070] text-white py-3 px-6 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {(loading || clubsLoading) ? (
                            <>
                                <LoadingSpinner size={18} className="text-white" />
                                <span>กำลังสร้างรายงาน...</span>
                            </>
                        ) : (
                            <>
                                <FilePlus   className="w-4 h-4" />
                                <span>สร้างรายงาน</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export { QuickReports, CustomReportBuilder };