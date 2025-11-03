import { Platform } from 'react-native';
import { Alert } from 'react-native';

interface ExportOptions {
  filename: string;
  title?: string;
}

class ExportService {
  private convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  async exportToCSV(data: any[], headers: string[], options: ExportOptions): Promise<boolean> {
    if (Platform.OS !== 'web') {
      Alert.alert('Інформація', 'Експорт доступний тільки на веб-платформі');
      return false;
    }

    try {
      const csv = this.convertToCSV(data, headers);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${options.filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return false;
    }
  }

  async exportClientsToCSV(clients: any[]): Promise<boolean> {
    const headers = ['full_name', 'email', 'phone', 'company', 'address', 'created_at'];
    const formattedData = clients.map((client) => ({
      full_name: client.full_name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      created_at: client.created_at ? new Date(client.created_at).toLocaleDateString('uk-UA') : '',
    }));

    return this.exportToCSV(formattedData, headers, {
      filename: `clients_${new Date().toISOString().split('T')[0]}`,
      title: 'Експорт клієнтів',
    });
  }

  async exportOrdersToCSV(orders: any[], clients: any[]): Promise<boolean> {
    const headers = ['title', 'client_name', 'amount', 'status', 'created_at'];
    const formattedData = orders.map((order) => {
      const client = clients.find((c) => c.id === order.client_id);
      return {
        title: order.title || '',
        client_name: client?.full_name || '',
        amount: order.amount ? `${order.amount} грн` : '',
        status: this.getStatusLabel(order.status),
        created_at: order.created_at ? new Date(order.created_at).toLocaleDateString('uk-UA') : '',
      };
    });

    return this.exportToCSV(formattedData, headers, {
      filename: `orders_${new Date().toISOString().split('T')[0]}`,
      title: 'Експорт замовлень',
    });
  }

  async exportAnalyticsToCSV(data: {
    kpis: any;
    revenueByMonth: any[];
    ordersByStatus: any[];
    topClients: any[];
  }): Promise<boolean> {
    const headers = ['metric', 'value'];
    const formattedData = [
      { metric: 'Загальний дохід', value: `${data.kpis.totalRevenue} грн` },
      { metric: 'Кількість замовлень', value: data.kpis.totalOrders },
      { metric: 'Кількість клієнтів', value: data.kpis.totalClients },
      { metric: 'Середній чек', value: `${data.kpis.avgOrderValue.toFixed(2)} грн` },
      { metric: 'Конверсія', value: `${data.kpis.conversionRate.toFixed(1)}%` },
      { metric: 'Активні клієнти', value: data.kpis.activeClients },
      { metric: '', value: '' },
      { metric: 'Дохід по місяцях', value: '' },
      ...data.revenueByMonth.map((item) => ({
        metric: item.label,
        value: `${item.value} грн`,
      })),
      { metric: '', value: '' },
      { metric: 'Замовлення по статусах', value: '' },
      ...data.ordersByStatus.map((item) => ({
        metric: item.label,
        value: item.value,
      })),
      { metric: '', value: '' },
      { metric: 'Топ клієнтів', value: '' },
      ...data.topClients.map((client) => ({
        metric: client.name,
        value: `${client.total} грн (${client.orders} замовлень)`,
      })),
    ];

    return this.exportToCSV(formattedData, headers, {
      filename: `analytics_${new Date().toISOString().split('T')[0]}`,
      title: 'Експорт аналітики',
    });
  }

  async exportMeetingsToCSV(meetings: any[], clients: any[]): Promise<boolean> {
    const headers = ['title', 'client_name', 'location', 'start_time', 'status'];
    const formattedData = meetings.map((meeting) => {
      const client = clients.find((c) => c.id === meeting.client_id);
      return {
        title: meeting.title || '',
        client_name: client?.full_name || '',
        location: meeting.location || '',
        start_time: meeting.start_time
          ? new Date(meeting.start_time).toLocaleString('uk-UA')
          : '',
        status: this.getStatusLabel(meeting.status),
      };
    });

    return this.exportToCSV(formattedData, headers, {
      filename: `meetings_${new Date().toISOString().split('T')[0]}`,
      title: 'Експорт зустрічей',
    });
  }

  async exportTasksToCSV(tasks: any[]): Promise<boolean> {
    const headers = ['title', 'priority', 'status', 'due_date', 'assigned_to'];
    const formattedData = tasks.map((task) => ({
      title: task.title || '',
      priority: this.getPriorityLabel(task.priority),
      status: this.getStatusLabel(task.status),
      due_date: task.due_date ? new Date(task.due_date).toLocaleDateString('uk-UA') : '',
      assigned_to: task.assigned_to || '',
    }));

    return this.exportToCSV(formattedData, headers, {
      filename: `tasks_${new Date().toISOString().split('T')[0]}`,
      title: 'Експорт завдань',
    });
  }

  private getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Очікує',
      in_progress: 'У роботі',
      completed: 'Виконано',
      cancelled: 'Скасовано',
      scheduled: 'Заплановано',
      confirmed: 'Підтверджено',
      active: 'Активна',
      draft: 'Чернетка',
    };
    return statusMap[status] || status;
  }

  private getPriorityLabel(priority: string): string {
    const priorityMap: Record<string, string> = {
      low: 'Низький',
      medium: 'Середній',
      high: 'Високий',
    };
    return priorityMap[priority] || priority;
  }
}

export const exportService = new ExportService();
