import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, ShoppingBag, Users, BarChart3, Menu } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const showCatalog = user?.role === 'citizen';
  const showClients = user?.role !== 'citizen';
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
            tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} />,
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

      {showClients && (
        <Tabs.Screen
          name="clients"
          options={{
            title: t('tabs.clients'),
            tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
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
