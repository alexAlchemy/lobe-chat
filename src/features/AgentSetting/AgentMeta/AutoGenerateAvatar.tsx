import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Wand2, Upload, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useFileStore } from '@/store/file';
import { getAvatarType } from '@/utils/avatar';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

export interface AutoGenerateAvatarProps {
  background?: string;
  canAutoGenerate?: boolean;
  loading?: boolean;
  onChange?: (value: string) => void;
  onGenerate?: () => void;
  value?: string;
}

const AutoGenerateAvatar = memo<AutoGenerateAvatarProps>(
  ({ loading, background, value, onChange, onGenerate, canAutoGenerate }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();
    const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);
    const [uploading, setUploading] = useState(false);

    const avatarType = getAvatarType(value || '');
    const isImageAvatar = avatarType === 'image';

    const handleImageUpload = async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      setUploading(true);
      try {
        const result = await uploadWithProgress({
          file,
          onStatusUpdate: () => {
            // Handle upload progress if needed
          },
          skipCheckFileType: false,
        });

        if (result?.url) {
          onChange?.(result.url);
        }
      } catch (error) {
        console.error('Failed to upload avatar image:', error);
      } finally {
        setUploading(false);
      }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
      // Reset the input value to allow re-selecting the same file
      event.target.value = '';
    };

    const handleImageUploadClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <Flexbox
        align={'center'}
        flex={'none'}
        gap={2}
        horizontal
        padding={2}
        style={{
          background: theme.colorBgContainer,
          border: `1px solid ${theme.colorBorderSecondary}`,
          borderRadius: 32,
          paddingRight: 8,
          width: 'fit-content',
        }}
      >
        {/* Hidden file input for image upload */}
        <input
          accept="image/*"
          onChange={handleFileInputChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          type="file"
        />

        {/* Avatar display - either emoji picker or image */}
        {isImageAvatar ? (
          <div
            onClick={handleImageUploadClick}
            style={{
              background: background || theme.colorFillTertiary,
              border: `1px solid ${theme.colorBorderSecondary}`,
              borderRadius: '50%',
              cursor: 'pointer',
              height: 48,
              overflow: 'hidden',
              position: 'relative',
              width: 48,
            }}
          >
            <img
              alt="Avatar"
              onError={(e) => {
                // Fallback to default emoji if image fails to load
                onChange?.('🤖');
              }}
              src={value}
              style={{
                height: '100%',
                objectFit: 'cover',
                width: '100%',
              }}
            />
            {/* Overlay icon on hover */}
            <div
              style={{
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                bottom: 0,
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                left: 0,
                opacity: 0,
                position: 'absolute',
                right: 0,
                top: 0,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            >
              <ImageIcon size={16} />
            </div>
          </div>
        ) : (
          <EmojiPicker
            background={background || theme.colorFillTertiary}
            loading={loading || uploading}
            locale={locale}
            onChange={onChange}
            size={48}
            style={{
              background: theme.colorFillTertiary,
            }}
            value={value}
          />
        )}

        {/* Upload image button */}
        <ActionIcon
          icon={Upload}
          loading={uploading}
          onClick={handleImageUploadClick}
          size="small"
          title={t('uploadFile', { ns: 'file' })}
        />

        {/* Auto-generate button */}
        <ActionIcon
          disabled={!canAutoGenerate}
          icon={Wand2}
          loading={loading}
          onClick={onGenerate}
          size="small"
          title={!canAutoGenerate ? t('autoGenerateTooltipDisabled') : t('autoGenerate')}
        />
      </Flexbox>
    );
  },
);

export default AutoGenerateAvatar;
