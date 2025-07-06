
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Star, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { fetchActivityHoursChart, fetchDashboardStats, fetchParticipationChart } from '../../services/http';
import { ErrorMessage, LoadingSpinner } from '../../components/Reports/ReportsDashboard';

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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 mb-1">การวิเคราะห์ชมรมและกิจกรรม</h1>
                        <p className="text-sm text-gray-500">ติดตามและวิเคราะห์ข้อมูลชมรมและกิจกรรมนักศึกษา</p>
                    </div>

                    {/* Modern Minimal Refresh Button */}
                    <button
                        onClick={() => handleRefresh()}
                        className="group relative bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl hover:border-[#640D5F]/30 hover:bg-[#640D5F]/5 hover:text-[#640D5F] transition-all duration-300 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                        <span className="text-sm">รีเฟรช</span>

                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 rounded-xl bg-[#640D5F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </button>
                </div>



                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {loading.stats ? (
                        // Loading state for stats
                        Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                                </div>
                            </div>
                        ))
                    ) : errors.stats ? (
                        <div className="col-span-4">
                            <ErrorMessage message={errors.stats} onRetry={loadDashboardStats} />
                        </div>
                    ) : (
                        statsData.map((stat, index) => (
                            <StatsCard key={index} {...stat} />
                        ))
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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


            </div>

        </div>);
};
export default CEMSDashboard;