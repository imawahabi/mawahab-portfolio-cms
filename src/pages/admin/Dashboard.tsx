import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Wrench, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Inbox,
  Plus,
  ArrowUpRight,
  Clock,
  Eye,
  Calendar,
  Users,
  Activity,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { Link } from 'react-router-dom';

const defaultStats = {
  totalProjects: 0,
  featuredProjects: 0,
  totalServices: 0,
  thisYearProjects: 0,
  totalMessages: 0,
  newMessages: 0,
  totalTestimonials: 0,
  pendingTestimonials: 0,
};

export default function Dashboard() {
  const { data: stats = defaultStats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: api.getAdminStats,
    retry: 1,
  }) as { data: typeof defaultStats; isLoading: boolean };

  // Fetch recent messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: api.getMessages,
    retry: 1,
  });

  // Fetch recent projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', 'dashboard', 'includeHidden'],
    queryFn: () => api.getProjects({ limit: 5, includeHidden: true }),
    retry: 1,
  });

  const recentMessages = useMemo(() => 
    (messages as any[]).slice(0, 4), 
    [messages]
  );

  const recentProjects = useMemo(() => 
    (projects as any[]).slice(0, 4), 
    [projects]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'إجمالي المشاريع',
        value: stats.totalProjects,
        icon: Briefcase,
        gradient: 'from-blue-500/20 to-blue-600/10',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-500',
        bgIcon: 'bg-blue-500/10',
        emoji: '📁',
        link: '/admin/projects',
      },
      {
        title: 'المشاريع المميزة',
        value: stats.featuredProjects,
        icon: TrendingUp,
        gradient: 'from-green-500/20 to-green-600/10',
        borderColor: 'border-green-500/30',
        iconColor: 'text-green-500',
        bgIcon: 'bg-green-500/10',
        emoji: '⭐',
        link: '/admin/projects',
      },
      {
        title: 'الخدمات',
        value: stats.totalServices,
        icon: Wrench,
        gradient: 'from-purple-500/20 to-purple-600/10',
        borderColor: 'border-purple-500/30',
        iconColor: 'text-purple-500',
        bgIcon: 'bg-purple-500/10',
        emoji: '🔧',
        link: '/admin/services',
      },
      {
        title: 'الرسائل الجديدة',
        value: stats.newMessages,
        icon: MessageSquare,
        gradient: 'from-red-500/20 to-red-600/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-500',
        bgIcon: 'bg-red-500/10',
        emoji: '💬',
        link: '/admin/messages',
        highlight: stats.newMessages > 0,
      },
      {
        title: 'آراء قيد الانتظار',
        value: stats.pendingTestimonials,
        icon: Inbox,
        gradient: 'from-amber-500/20 to-amber-600/10',
        borderColor: 'border-amber-500/30',
        iconColor: 'text-amber-500',
        bgIcon: 'bg-amber-500/10',
        emoji: '⏳',
        link: '/admin/testimonials',
        highlight: stats.pendingTestimonials > 0,
      },
      {
        title: 'إجمالي الآراء',
        value: stats.totalTestimonials,
        icon: Star,
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        borderColor: 'border-emerald-500/30',
        iconColor: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10',
        emoji: '⭐',
        link: '/admin/testimonials',
      },
    ],
    [stats],
  );

  const quickActions = [
    { label: 'إضافة مشروع', icon: Plus, link: '/admin/projects', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'إضافة خدمة', icon: Plus, link: '/admin/services', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'عرض الرسائل', icon: Eye, link: '/admin/messages', color: 'bg-red-600 hover:bg-red-700' },
    { label: 'إدارة التصنيفات', icon: Zap, link: '/admin/categories', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header with Welcome Message */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  مرحباً بك في لوحة التحكم
                </h1>
                <p className="text-muted-foreground mt-1">نظرة عامة على إحصائيات موقعك وآخر التحديثات</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('ar-UK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <LoadingSpinner message="جاري تحميل الإحصائيات..." size="lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                  <div className="h-8 bg-slate-700/50 rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} to={stat.link}>
                  <Card 
                    className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} p-6 hover:border-primary/50 transition-all duration-300 group cursor-pointer h-full ${stat.highlight ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background' : ''}`}
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                    </div>

                    {/* Highlight Badge */}
                    {stat.highlight && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground animate-pulse">جديد</Badge>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                          <span className="text-2xl">{stat.emoji}</span>
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${stat.bgIcon} border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Bottom Accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">مشاريع هذا العام</p>
                  <p className="text-3xl font-bold text-primary">{stats.thisYearProjects}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">إجمالي الرسائل</p>
                  <p className="text-3xl font-bold text-emerald-500">{stats.totalMessages}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <MessageSquare className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">آراء بانتظار المراجعة</p>
                  <p className="text-3xl font-bold text-amber-500">{stats.pendingTestimonials}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <MessageSquare className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold">آخر الرسائل</h3>
                </div>
                <Link to="/admin/messages">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    عرض الكل
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentMessages.length > 0 ? (
                  recentMessages.map((message: any, index: number) => (
                    <div key={message.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                      <div className="p-2 rounded-full bg-slate-700/50">
                        <Users className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{message.name || 'زائر'}</p>
                        <p className="text-xs text-muted-foreground truncate">{message.message || message.subject}</p>
                      </div>
                      {message.status === 'new' && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-500 text-xs">جديد</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد رسائل حتى الآن</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Projects */}
            <Card className="p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold">آخر المشاريع</h3>
                </div>
                <Link to="/admin/projects">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    عرض الكل
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project: any, index: number) => (
                    <div key={project.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.titleAr} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{project.titleAr || project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.mainCategory}</p>
                      </div>
                      {project.isFeatured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد مشاريع حتى الآن</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
