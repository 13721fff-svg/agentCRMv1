import { Platform, Alert } from 'react-native';

interface ReportData {
  title: string;
  subtitle?: string;
  date: string;
  sections: Array<{
    title: string;
    data: Array<Record<string, any>>;
  }>;
  summary?: Record<string, any>;
}

class PDFService {
  async generateOrdersReport(orders: any[], clients: any[]): Promise<void> {
    const reportData: ReportData = {
      title: 'Звіт по замовленнях',
      date: new Date().toLocaleDateString('uk-UA'),
      sections: [
        {
          title: 'Замовлення',
          data: orders.map((o) => {
            const client = clients.find((c) => c.id === o.client_id);
            return {
              'ID': o.id.slice(0, 8),
              'Назва': o.title,
              'Клієнт': client?.full_name || 'N/A',
              'Статус': o.status,
              'Сума': o.total_amount ? `${o.total_amount} грн` : 'N/A',
              'Дата': new Date(o.created_at).toLocaleDateString('uk-UA'),
            };
          }),
        },
      ],
      summary: {
        'Всього замовлень': orders.length,
        'Загальна сума': orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) + ' грн',
      },
    };

    await this.generatePDF(reportData);
  }

  async generateClientsReport(clients: any[]): Promise<void> {
    const reportData: ReportData = {
      title: 'Звіт по клієнтах',
      date: new Date().toLocaleDateString('uk-UA'),
      sections: [
        {
          title: 'Клієнти',
          data: clients.map((c) => ({
            'ID': c.id.slice(0, 8),
            'ПІБ': c.full_name,
            'Email': c.email || 'N/A',
            'Телефон': c.phone || 'N/A',
            'Рейтинг': c.rating ? `${c.rating}/5` : 'N/A',
            'Дата реєстрації': new Date(c.created_at).toLocaleDateString('uk-UA'),
          })),
        },
      ],
      summary: {
        'Всього клієнтів': clients.length,
      },
    };

    await this.generatePDF(reportData);
  }

  async generateAnalyticsReport(data: any): Promise<void> {
    const reportData: ReportData = {
      title: 'Аналітичний звіт',
      date: new Date().toLocaleDateString('uk-UA'),
      sections: [
        {
          title: 'KPI метрики',
          data: [
            {
              'Метрика': 'Дохід',
              'Значення': `${data.revenue || 0} грн`,
            },
            {
              'Метрика': 'Нові клієнти',
              'Значення': data.newClients || 0,
            },
            {
              'Метрика': 'Замовлення',
              'Значення': data.ordersCount || 0,
            },
            {
              'Метрика': 'Зустрічі',
              'Значення': data.meetingsCount || 0,
            },
          ],
        },
      ],
      summary: {
        'Період': data.period || 'N/A',
      },
    };

    await this.generatePDF(reportData);
  }

  private async generatePDF(data: ReportData): Promise<void> {
    if (Platform.OS === 'web') {
      this.generateWebPDF(data);
    } else {
      Alert.alert(
        'Інформація',
        'PDF звіти доступні тільки у веб-версії. Використайте експорт CSV для мобільних пристроїв.'
      );
    }
  }

  private generateWebPDF(data: ReportData): void {
    const htmlContent = this.generateHTML(data);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Alert.alert('Помилка', 'Дозвольте спливаючі вікна для генерації PDF');
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  }

  private generateHTML(data: ReportData): string {
    const tableRows = data.sections
      .map(
        (section) => `
      <h2 style="color: #1f2937; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">
        ${section.title}
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            ${Object.keys(section.data[0] || {})
              .map(
                (key) => `
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">
                ${key}
              </th>
            `
              )
              .join('')}
          </tr>
        </thead>
        <tbody>
          ${section.data
            .map(
              (row, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
              ${Object.values(row)
                .map(
                  (value) => `
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  ${value}
                </td>
              `
                )
                .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
      )
      .join('');

    const summaryRows = data.summary
      ? Object.entries(data.summary)
          .map(
            ([key, value]) => `
        <tr>
          <td style="padding: 8px; font-weight: 600;">${key}:</td>
          <td style="padding: 8px;">${value}</td>
        </tr>
      `
          )
          .join('')
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #374151;
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 30px;">
          <h1 style="color: #111827; margin: 0 0 10px 0; font-size: 28px;">${data.title}</h1>
          ${data.subtitle ? `<p style="color: #6b7280; margin: 0 0 5px 0;">${data.subtitle}</p>` : ''}
          <p style="color: #6b7280; margin: 0;">Дата: ${data.date}</p>
        </div>

        ${tableRows}

        ${
          summaryRows
            ? `
          <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Підсумок</h3>
            <table style="width: 100%;">
              ${summaryRows}
            </table>
          </div>
        `
            : ''
        }

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Згенеровано AgentCRM • ${new Date().toLocaleString('uk-UA')}</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const pdfService = new PDFService();
