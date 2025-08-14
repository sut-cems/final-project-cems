
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Star, RefreshCw, PieChart, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { fetchActivityHoursChart, fetchDashboardStats, fetchParticipationChart } from '../../services/http';
import { ErrorMessage, LoadingSpinner } from '../../components/Reports/ReportsDashboard';
import { getActivityStatusDistribution, getAverageAttendanceRate, getClubStatistics, getTopActivities, type ActivityStatusDistribution, type AttendanceRate, type ClubStat, type TopActivity } from '../../services/http/dashboard';

export interface DashboardStats {
    total_activities: number;
    total_participants: number;
    total_hours: number;
    average_rating: number;
    total_registrations: number;
    growth_percentage: {
        activities: number;
        participants: number;
        hours: number;
        rating: number;
        registrations: number;
    };
    period_info: {
        current_month: string;
        last_month: string;
    };
}

export interface ParticipationChart {
    labels: string[];
    data: number[];
}

export interface ActivityHoursChart {
    labels: string[];
    data: number[];
    colors: string[];
}



interface StatCard {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
    gradient: string;
}

const COLORS = {
    primary: '#640D5F',
    secondary: '#D91656',
    accent: '#EB5B00',
    highlight: '#FFB200'
};

// Stats Card Component
const StatsCard: React.FC<StatCard> = ({ title, value, change, icon, gradient }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    <p className="text-green-500 text-sm">{change}</p>
                </div>
                <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};


// Participation Chart Component
const ParticipationChart: React.FC<{ data: ParticipationChart | null; loading: boolean; error: string | null; onRetry: () => void }> = ({ data, loading, error, onRetry }) => {
    const convertMonthToThai = (month: string): string => {
        const monthMap: { [key: string]: string } = {
            'Jan': 'ม.ค.',
            'Feb': 'ก.พ.',
            'Mar': 'มี.ค.',
            'Apr': 'เม.ย.',
            'May': 'พ.ค.',
            'Jun': 'มิ.ย.',
            'Jul': 'ก.ค.',
            'Aug': 'ส.ค.',
            'Sep': 'ก.ย.',
            'Oct': 'ต.ค.',
            'Nov': 'พ.ย.',
            'Dec': 'ธ.ค.'
        };
        return monthMap[month] || month;
    };

    const chartData = data ? data.labels.map((label, index) => ({
        month: convertMonthToThai(label),
        ผู้เข้าร่วม: data.data[index]
    })) : [];

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-center justify-center h-80">
                <LoadingSpinner size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">การเข้าร่วมกิจกรรมรายเดือน</h3>
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">การเข้าร่วมกิจกรรมรายเดือน</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="ผู้เข้าร่วม"
                        stroke="#640D5F"
                        strokeWidth={3}
                        fill="rgba(100, 13, 95, 0.1)"
                        dot={{ fill: '#640D5F', strokeWidth: 2, r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Hours Chart Component
const HoursChart: React.FC<{ data: ActivityHoursChart | null; loading: boolean; error: string | null; onRetry: () => void }> = ({ data, loading, error, onRetry }) => {
    const chartData = data ? data.labels.map((label, index) => ({
        name: label,
        value: data.data[index],
        color: data.colors[index]
    })) : [];

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-center justify-center h-80">
                <LoadingSpinner size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">ชั่วโมงกิจกรรมตามประเภท</h3>
                <ErrorMessage message={error} onRetry={onRetry} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">ชั่วโมงกิจกรรมตามประเภท</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Top Activities Component
const TopActivitiesCard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<TopActivity[]>([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getTopActivities();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-80">
                <div className="flex items-center justify-center h-full">
                    <LoadingSpinner size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Trophy className="w-6 h-6 mr-2 text-[#FFB200]" />
                    กิจกรรมยอดนิยม TOP 3
                </h3>
                <ErrorMessage message={error} onRetry={loadData} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#FFB200] flex-shrink-0" />
                <span className="truncate">กิจกรรมยอดนิยม TOP 3</span>
            </h3>
            <div className="space-y-3 sm:space-y-4">
                {data.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${index === 0 ? 'bg-[#FFB200]' :
                                index === 1 ? 'bg-[#EB5B00]' :
                                    'bg-[#D91656]'
                                }`}>
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{activity.title}</h4>
                                <p className="text-gray-500 text-xs sm:text-sm truncate">{activity.club_name}</p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                            <p className="font-bold text-[#640D5F] text-sm sm:text-base">{activity.join_count}</p>
                            <p className="text-xs text-gray-500">ผู้เข้าร่วม</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Attendance Rate Component
const AttendanceRateCard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AttendanceRate | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getAverageAttendanceRate();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center h-48">
                    <LoadingSpinner size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-[#EB5B00]" />
                    อัตราการเข้าร่วมเฉลี่ย
                </h3>
                <ErrorMessage message={error} onRetry={loadData} />
            </div>
        );
    }

    const percentage = data ? (data.average_rate * 100).toFixed(2) : '0.00';

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            {/* Header */}
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-[#EB5B00]" />
                อัตราการเข้าร่วมเฉลี่ย
            </h3>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[200px]">
                {/* Main metric */}
                <div className="text-center">
                    <div className="text-5xl font-bold text-[#640D5F] mb-2">
                        {percentage}%
                    </div>
                    <p className="text-gray-500 text-base">อัตราการเข้าร่วมกิจกรรมโดยเฉลี่ย</p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-md">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-[#640D5F] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// Club Statistics Component
const ClubStatisticsCard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ClubStat[]>([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getClubStatistics();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const chartData = data.slice(0, 10).map(club => ({
        name: club.club_name.length > 15 ? club.club_name.substring(0, 15) + '...' : club.club_name,
        กิจกรรม: club.activities,
        ผู้เข้าร่วม: club.participants
    }));

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-[#D91656]" />
                    สถิติชมรม
                </h3>
                <ErrorMessage message={error} onRetry={loadData} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-[#D91656]" />
                สถิติชมรม
            </h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="กิจกรรม" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ผู้เข้าร่วม" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Status Distribution Component
const StatusDistributionCard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ActivityStatusDistribution[]>([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getActivityStatusDistribution();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const chartData = data.map((item, index) => ({
        name: item.status === 'approved' ? 'อนุมัติ' : 'เสร็จสิ้น',
        value: item.count,
        color: index === 0 ? COLORS.accent : COLORS.highlight
    }));

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-center h-80">
                    <LoadingSpinner size={32} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <PieChart className="w-6 h-6 mr-2 text-[#EB5B00]" />
                    สถานะกิจกรรม
                </h3>
                <ErrorMessage message={error} onRetry={loadData} />
            </div>
        );
    }
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <PieChart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-[#EB5B00] flex-shrink-0" />
                <span className="truncate">สถานะกิจกรรม</span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center space-x-4 sm:space-x-6">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs sm:text-sm text-gray-600">{item.name}: {item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Dashboard Component
const CEMSDashboard: React.FC = () => {
    const [mounted, setMounted] = useState(false);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [participationData, setParticipationData] = useState<ParticipationChart | null>(null);
    const [hoursData, setHoursData] = useState<ActivityHoursChart | null>(null);
    const [loading, setLoading] = useState({
        stats: true,
        participation: true,
        hours: true,
        reports: true,
        generateReport: false
    });
    const [errors, setErrors] = useState({
        stats: null as string | null,
        participation: null as string | null,
        hours: null as string | null,
        reports: null as string | null
    });

    useEffect(() => {
        setMounted(true);
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadDashboardStats(),
            loadParticipationData(),
            loadHoursData(),
        ]);
    };

    const loadDashboardStats = async () => {
        try {
            setLoading(prev => ({ ...prev, stats: true }));
            setErrors(prev => ({ ...prev, stats: null }));
            const data = await fetchDashboardStats();
            setDashboardStats(data);
        } catch (error) {
            setErrors(prev => ({ ...prev, stats: (error as Error).message }));
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    };

    const loadParticipationData = async () => {
        try {
            setLoading(prev => ({ ...prev, participation: true }));
            setErrors(prev => ({ ...prev, participation: null }));
            const data = await fetchParticipationChart();
            setParticipationData(data);
        } catch (error) {
            setErrors(prev => ({ ...prev, participation: (error as Error).message }));
        } finally {
            setLoading(prev => ({ ...prev, participation: false }));
        }
    };

    const loadHoursData = async () => {
        try {
            setLoading(prev => ({ ...prev, hours: true }));
            setErrors(prev => ({ ...prev, hours: null }));
            const data = await fetchActivityHoursChart();
            setHoursData(data);
        } catch (error) {
            setErrors(prev => ({ ...prev, hours: (error as Error).message }));
        } finally {
            setLoading(prev => ({ ...prev, hours: false }));
        }
    };

    const getStatsData = (): StatCard[] => {
        if (!dashboardStats) return [];

        return [
            {
                title: 'กิจกรรมทั้งหมด',
                value: dashboardStats.total_activities.toLocaleString(),
                change: `${dashboardStats.growth_percentage.activities > 0 ? '+' : ''}${dashboardStats.growth_percentage.activities}% จากเดือนที่แล้ว`,
                icon: <Calendar className="w-8 h-8 text-white" />,
                gradient: 'bg-gradient-to-r from-orange-500 to-yellow-500'
            },
            {
                title: 'ผู้เข้าร่วมทั้งหมด',
                value: dashboardStats.total_participants.toLocaleString(),
                change: `${dashboardStats.growth_percentage.participants > 0 ? '+' : ''}${dashboardStats.growth_percentage.participants}% จากเดือนที่แล้ว`,
                icon: <Users className="w-8 h-8 text-white" />,
                gradient: 'bg-gradient-to-r from-purple-600 to-purple-700'
            },
            {
                title: 'ชั่วโมงกิจกรรมทั้งหมด',
                value: dashboardStats.total_hours.toLocaleString(),
                change: `${dashboardStats.growth_percentage.hours > 0 ? '+' : ''}${dashboardStats.growth_percentage.hours}% จากเดือนที่แล้ว`,
                icon: <Clock className="w-8 h-8 text-white" />,
                gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
            },
            {
                title: 'การประเมินเฉลี่ย',
                value: dashboardStats.average_rating.toFixed(1),
                change: `${dashboardStats.growth_percentage.rating > 0 ? '+' : ''}${dashboardStats.growth_percentage.rating}% จากเดือนที่แล้ว`,
                icon: <Star className="w-8 h-8 text-white" />,
                gradient: 'bg-gradient-to-r from-green-500 to-green-600'
            }
        ];
    };

    if (!mounted) return null;

    const statsData = getStatsData();

    function handleRefresh(): void {
        loadAllData();
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                            การวิเคราะห์ชมรมและกิจกรรม
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            ติดตามและวิเคราะห์ข้อมูลชมรมและกิจกรรมนักศึกษา
                        </p>
                    </div>

                    {/* Responsive Refresh Button */}
                    <div className="flex justify-end sm:justify-start">
                        <button
                            onClick={() => handleRefresh()}
                            className="group relative bg-white border border-gray-200 text-gray-600 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:border-[#640D5F]/30 hover:bg-[#640D5F]/5 hover:text-[#640D5F] transition-all duration-300 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md active:scale-95 min-w-0"
                        >
                            <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0" />
                            <span className="text-sm hidden sm:inline">รีเฟรช</span>
                            <div className="absolute inset-0 rounded-xl bg-[#640D5F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </button>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    {loading.stats ? (
                        // Loading state for stats - Responsive
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-2xl flex-shrink-0 ml-4"></div>
                                </div>
                            </div>
                        ))
                    ) : errors.stats ? (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                            <ErrorMessage message={errors.stats} onRetry={loadDashboardStats} />
                        </div>
                    ) : (
                        statsData.map((stat, index) => (
                            <StatsCard key={index} {...stat} />
                        ))
                    )}
                </div>

                {/* Charts Section - Optimized Layout */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Main Charts Row - 2 columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <ParticipationChart
                            data={participationData}
                            loading={loading.participation}
                            error={errors.participation}
                            onRetry={loadParticipationData}
                        />
                        <HoursChart
                            data={hoursData}
                            loading={loading.hours}
                            error={errors.hours}
                            onRetry={loadHoursData}
                        />
                    </div>

                    {/* Secondary Row - 2 columns with better proportions */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        <TopActivitiesCard />
                        <AttendanceRateCard />
                        <StatusDistributionCard />
                    </div>

                    {/* Bottom Row - Full width */}
                    <div className="grid grid-cols-1">
                        <ClubStatisticsCard />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CEMSDashboard;