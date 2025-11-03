import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ShoppingBag,
  Users,
  BarChart3,
  Menu,
  CheckSquare,
  Calendar,
  Megaphone,
  UsersRound,
  Target,
  Package,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const showCatalog = user?.role === 'citizen';
  const showBusiness = user?.role !== 'citizen';
  const showTasks = user?.role === 'individual' || user?.role === 'small' || user?.role === 'medium';
  const showMeetings = user?.role === 'individual' || user?.role === 'small' || user?.role === 'medium';
  const showCampaigns = user?.role === 'individual' || user?.role === 'small' || user?.role === 'medium';
  const showTeam = user?.role === 'small' || user?.role === 'medium';
  const showAnalytics = user?.role === 'small' || user?.role === 'medium';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />

      {showCatalog && (
        <Tabs.Screen
          name="catalog"
          options={{
            title: t('tabs.catalog'),
            tabBarIcon: ({ size, color }) => <Package size={size} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} />,
        }}
      />

      {showBusiness && (
        <Tabs.Screen
          name="clients"
          options={{
            title: t('tabs.clients'),
            tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
          }}
        />
      )}

      {showTasks && (
        <Tabs.Screen
          name="tasks"
          options={{
            title: t('tabs.tasks'),
            tabBarIcon: ({ size, color }) => <CheckSquare size={size} color={color} />,
          }}
        />
      )}

      {showMeetings && (
        <Tabs.Screen
          name="meetings"
          options={{
            title: t('tabs.meetings'),
            tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
          }}
        />
      )}

      {showCampaigns && (
        <Tabs.Screen
          name="campaigns"
          options={{
            title: t('tabs.campaigns'),
            tabBarIcon: ({ size, color }) => <Megaphone size={size} color={color} />,
          }}
        />
      )}

      {showTeam && (
        <Tabs.Screen
          name="team"
          options={{
            title: t('tabs.team'),
            tabBarIcon: ({ size, color }) => <UsersRound size={size} color={color} />,
          }}
        />
      )}

      {showAnalytics && (
        <Tabs.Screen
          name="analytics"
          options={{
            title: t('tabs.analytics'),
            tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ size, color }) => <Menu size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
