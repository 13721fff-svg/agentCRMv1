import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Bell, ChevronRight } from 'lucide-react-native';
import tw from '@/lib/tw';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { useAppStore } from '@/store/appStore';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    const newLang = language === 'uk' ? 'en' : 'uk';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <View style={tw`flex-1 bg-neutral-50`}>
      <Header title={t('profile.settings')} showBack />

      <ScrollView contentContainerStyle={tw`p-4`}>
        <TouchableOpacity onPress={toggleLanguage} activeOpacity={0.7}>
          <Card style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View style={tw`w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3`}>
                  <Globe size={20} color="#0284c7" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-neutral-900 mb-1`}>
                    {t('profile.language')}
                  </Text>
                  <Text style={tw`text-sm text-neutral-600`}>
                    {language === 'uk' ? 'Українська' : 'English'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#a3a3a3" />
            </View>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
          <Card style={tw`mb-3`}>
            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View style={tw`w-10 h-10 rounded-full bg-neutral-200 items-center justify-center mr-3`}>
                  <Moon size={20} color="#525252" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-base font-medium text-neutral-900 mb-1`}>
                    {t('profile.theme')}
                  </Text>
                  <Text style={tw`text-sm text-neutral-600`}>
                    {theme === 'light' ? t('profile.light') : t('profile.dark')}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#a3a3a3" />
            </View>
          </Card>
        </TouchableOpacity>

        <Card style={tw`mb-3`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center flex-1`}>
              <View style={tw`w-10 h-10 rounded-full bg-warning-100 items-center justify-center mr-3`}>
                <Bell size={20} color="#f59e0b" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-base font-medium text-neutral-900 mb-1`}>
                  {t('profile.notifications')}
                </Text>
                <Text style={tw`text-sm text-neutral-600`}>Увімкнено</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#a3a3a3" />
          </View>
        </Card>

        <Card>
          <Text style={tw`text-sm text-neutral-600 text-center`}>
            {t('app.name')} v1.0.0
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
