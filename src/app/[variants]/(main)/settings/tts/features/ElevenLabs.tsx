'use client';

import { Form, type FormGroupItemType, Icon } from '@lobehub/ui';
import { Input, Select } from '@lobehub/ui';
import { Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import { Loader2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { elevenLabsTTSOptions } from './const';

const ElevenLabs = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const { tts } = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, isUserStateInit] = useUserStore((s) => [s.setSettings, s.isUserStateInit]);
  const [loading, setLoading] = useState(false);

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const elevenLabs: FormGroupItemType = {
    children: [
      {
        children: <Input.Password placeholder="sk-..." />,
        label: t('settingTTS.elevenlabs.apiKey'),
        name: ['elevenlabs', 'apiKey'],
      },
      {
        children: <Select options={elevenLabsTTSOptions} />,
        label: t('settingTTS.elevenlabs.model'),
        name: ['elevenlabs', 'model'],
      },
    ],
    extra: loading && <Icon icon={Loader2Icon} size={16} spin style={{ opacity: 0.5 }} />,
    title: t('settingTTS.elevenlabs.title'),
  };

  return (
    <Form
      form={form}
      initialValues={tts}
      items={[elevenLabs]}
      itemsType={'group'}
      onValuesChange={async (values) => {
        setLoading(true);
        await setSettings({
          tts: values,
        });
        setLoading(false);
      }}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

export default ElevenLabs;