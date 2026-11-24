import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  Clock, 
  MessageSquare, 
  CheckCheck, 
  Trash2, 
  Inbox, 
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Reply,
  MailOpen,
  User,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Folder
} from 'lucide-react';
import LoadingSpinner, { TableSkeleton } from '@/components/admin/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getStatusInfo = (status: string) => {
  if (status === 'replied')
    return {
      color: 'from-emerald-500/20 to-emerald-600/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'تم الرد',
      icon: CheckCheck,
      bg: 'bg-emerald-500/10',
    };
  if (status === 'seen')
    return {
      color: 'from-blue-500/20 to-blue-600/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      label: 'تمت المشاهدة',
      icon: Eye,
      bg: 'bg-blue-500/10',
    };
  return {
    color: 'from-amber-500/20 to-amber-600/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    label: 'جديدة',
    icon: Sparkles,
    bg: 'bg-amber-500/10',
  };
};

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  createdAt: string;
  mainCategory?: string | null;
  subCategory?: string | null;
  selectedService?: string | null;
};

const formatMessageBody = (text?: string) => {
  if (!text) return '';
  return text
    .replace(/Category:.*(\r?\n)?/gi, '')
    .replace(/Service:.*(\r?\n)?/gi, '')
    .replace(/Notes:\s?/gi, '')
    .trim();
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [messagesData, categoriesData] = await Promise.all([
        api.getMessages(),
        api.getCategories()
      ]);
      setMessages(messagesData);
      setCategories(categoriesData?.main || []);
    } catch {
      toast.error('فشل في جلب الرسائل');
    } finally {
      setLoading(false);
    }
  };

  // Get category name by ID
  const getMainCategoryName = (msg: Message) => {
    if (!msg.mainCategory) return '';
    if (msg.mainCategory === 'custom-other') {
      return msg.selectedService || 'أخرى / استشارة مخصصة';
    }
    const category = categories.find(cat => cat.value === msg.mainCategory);
    if (category) return category.labelAr || category.labelEn || msg.mainCategory;
    return msg.mainCategory;
  };

  const getSubCategoryName = (msg: Message) => {
    if (!msg.subCategory) return '';
    const main = categories.find(cat => cat.value === (msg.mainCategory || ''));
    const sub = main?.subcategories?.find((s: any) => s.value === msg.subCategory);
    if (sub) return sub.labelAr || sub.labelEn || msg.subCategory;
    return msg.subCategory;
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const categoryName = getMainCategoryName(msg);
      const subName = getSubCategoryName(msg);
      const matchesSearch = !search || 
        msg.name.toLowerCase().includes(search.toLowerCase()) ||
        msg.email.toLowerCase().includes(search.toLowerCase()) ||
        msg.message.toLowerCase().includes(search.toLowerCase()) ||
        categoryName.toLowerCase().includes(search.toLowerCase()) ||
        subName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter, categories]);

  // Update message status
  const handleStatusUpdate = async (id: string, status: string) => {
    const originalMessages = [...messages];
    
    try {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status } : msg
      ));

      toast.loading('جاري تحديث حالة الرسالة...', { id: 'statusUpdate' });

      await api.updateMessageStatus(id, status);

      toast.success('تم تحديث حالة الرسالة بنجاح', { id: 'statusUpdate' });
    } catch (error) {
      console.error('Error updating message status:', error);
      setMessages(originalMessages);
      toast.error('حدث خطأ أثناء تحديث حالة الرسالة', { 
        id: 'statusUpdate',
        description: error.message || 'الرجاء المحاولة مرة أخرى لاحقاً'
      });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('حذف الرسالة؟')) return;
    try {
      await api.deleteMessage(id);
      toast.success('تم الحذف');
      load();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = messages.filter((m) => m.status === 'new').length;
  const seenCount = messages.filter((m) => m.status === 'seen').length;
  const repliedCount = messages.filter((m) => m.status === 'replied').length;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border border-red-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
              <MessageSquare className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                رسائل التواصل
              </h1>
              <p className="text-muted-foreground mt-1">إدارة الرسائل الواردة وتحديث حالتها</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={load} 
              disabled={loading}
              className="gap-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">رسائل جديدة</p>
              <p className="text-4xl font-bold text-red-400 mt-2">{unreadCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <Sparkles className="w-6 h-6 text-red-400" />
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="absolute top-3 left-3">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 p-6 hover:border-blue-500/30 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">تم قراءتها</p>
              <p className="text-4xl font-bold text-blue-400 mt-2">{seenCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 p-6 hover:border-emerald-500/30 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">تم الرد عليها</p>
              <p className="text-4xl font-bold text-emerald-400 mt-2">{repliedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 p-6 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">إجمالي الرسائل</p>
              <p className="text-4xl font-bold text-purple-400 mt-2">{messages.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Inbox className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم، البريد، الخدمة أو نص الرسالة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 h-11 bg-slate-800/50 border-slate-700 focus:border-red-500/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 h-11 bg-slate-800/50 border-slate-700">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="فلترة حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الرسائل</SelectItem>
              <SelectItem value="new">جديدة</SelectItem>
              <SelectItem value="seen">تمت المشاهدة</SelectItem>
              <SelectItem value="replied">تم الرد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <LoadingSpinner message="جاري تحميل الرسائل..." size="lg" />
            <TableSkeleton rows={5} />
          </div>
        ) : filteredMessages.length === 0 ? (
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
              <Inbox className="w-12 h-12 text-red-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">لا توجد رسائل</p>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== 'all' 
                  ? 'لا توجد نتائج مطابقة للبحث' 
                  : 'ستظهر الرسائل الواردة هنا'}
              </p>
            </div>
          </Card>
        ) : (
          filteredMessages.map((msg) => {
            const statusInfo = getStatusInfo(msg.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card 
                key={msg.id} 
                className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 hover:border-slate-600/70 transition-all duration-300 group ${msg.status === 'new' ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 right-0 h-full w-1 bg-gradient-to-b ${statusInfo.color}`} />
                
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-lg flex-shrink-0">
                        {msg.name?.charAt(0) || 'م'}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground">{msg.name}</h3>
                          <Badge className={`${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors">
                            <Mail className="w-4 h-4" /> 
                            <a href={`mailto:${msg.email}`}>{msg.email}</a>
                          </span>
                          {msg.phone && (
                            <span className="flex items-center gap-2 text-muted-foreground hover:text-green-400 transition-colors">
                              <Phone className="w-4 h-4" /> 
                              <a href={`tel:${msg.phone}`}>{msg.phone}</a>
                            </span>
                          )}
                          {msg.mainCategory && (
                            <span className="flex items-center gap-2 text-muted-foreground hover:text-purple-400 transition-colors">
                              <Folder className="w-4 h-4" />
                              {getMainCategoryName(msg)}
                            </span>
                          )}
                          {msg.subCategory && (
                            <span className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors">
                              <Folder className="w-4 h-4" />
                              {getSubCategoryName(msg)}
                            </span>
                          )}
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" /> 
                            {new Date(msg.createdAt).toLocaleDateString('ar-UK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {msg.mainCategory && (
                        <span className="inline-flex items-center gap-2 bg-slate-700/40 px-3 py-1 rounded-lg">
                          <Folder className="w-4 h-4" />
                          {msg.mainCategory === 'custom-other'
                            ? (msg.selectedService || 'تصنيف مخصص')
                            : getMainCategoryName(msg)}
                        </span>
                      )}
                      {msg.subCategory && (
                        <span className="inline-flex items-center gap-2 bg-slate-700/40 px-3 py-1 rounded-lg">
                          <Folder className="w-4 h-4" />
                          {getSubCategoryName(msg)}
                        </span>
                      )}
                      {msg.selectedService && (
                        <span className="inline-flex items-center gap-2 bg-slate-700/40 px-3 py-1 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                          {msg.selectedService}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2 uppercase tracking-wide">
                        <MessageSquare className="w-4 h-4" /> نص الرسالة
                      </p>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {formatMessageBody(msg.message)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
                    {msg.status !== 'seen' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStatusUpdate(msg.id, 'seen')} 
                        className="gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/50"
                      >
                        <Eye className="w-4 h-4" />
                        تم المشاهدة
                      </Button>
                    )}
                    {msg.status !== 'replied' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleStatusUpdate(msg.id, 'replied')} 
                        className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50"
                      >
                        <Reply className="w-4 h-4" />
                        تم الرد
                      </Button>
                    )}
                    <a href={`mailto:${msg.email}`}>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/50"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        إرسال رد
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => remove(msg.id)} 
                      className="gap-2 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 mr-auto"
                    >
                      <Trash2 className="w-4 h-4" /> حذف
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
