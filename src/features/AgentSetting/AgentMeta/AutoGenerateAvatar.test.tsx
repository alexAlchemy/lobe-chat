import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from 'antd-style';

import AutoGenerateAvatar from '../AutoGenerateAvatar';

// Mock dependencies
vi.mock('@/store/global', () => ({
  useGlobalStore: vi.fn(() => 'en-US'),
}));

vi.mock('@/store/global/selectors', () => ({
  globalGeneralSelectors: {
    currentLanguage: vi.fn(),
  },
}));

vi.mock('@/store/file', () => ({
  useFileStore: vi.fn(() => ({
    uploadWithProgress: vi.fn(),
  })),
}));

vi.mock('@lobehub/ui/es/EmojiPicker', () => ({
  default: vi.fn(({ onChange, value }) => (
    <div data-testid="emoji-picker" onClick={() => onChange?.('🤖')}>
      {value || 'Pick emoji'}
    </div>
  )),
}));

const mockTheme = {
  colorBgContainer: '#ffffff',
  colorBorderSecondary: '#d9d9d9',
  colorFillTertiary: '#f5f5f5',
};

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

describe('AutoGenerateAvatar', () => {
  const mockOnChange = vi.fn();
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render emoji picker for emoji avatars', () => {
    render(
      <ThemeWrapper>
        <AutoGenerateAvatar
          value="🤖"
          onChange={mockOnChange}
          onGenerate={mockOnGenerate}
          canAutoGenerate={true}
        />
      </ThemeWrapper>
    );

    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
    expect(screen.getByTitle('uploadFile')).toBeInTheDocument();
    expect(screen.getByTitle('autoGenerate')).toBeInTheDocument();
  });

  it('should render image display for image URLs', () => {
    render(
      <ThemeWrapper>
        <AutoGenerateAvatar
          value="https://example.com/avatar.jpg"
          onChange={mockOnChange}
          onGenerate={mockOnGenerate}
          canAutoGenerate={true}
        />
      </ThemeWrapper>
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByTitle('uploadFile')).toBeInTheDocument();
    expect(screen.getByTitle('autoGenerate')).toBeInTheDocument();
  });

  it('should fallback to emoji when image fails to load', () => {
    render(
      <ThemeWrapper>
        <AutoGenerateAvatar
          value="https://example.com/broken-avatar.jpg"
          onChange={mockOnChange}
          onGenerate={mockOnGenerate}
          canAutoGenerate={true}
        />
      </ThemeWrapper>
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(mockOnChange).toHaveBeenCalledWith('🤖');
  });

  it('should show disabled state when canAutoGenerate is false', () => {
    render(
      <ThemeWrapper>
        <AutoGenerateAvatar
          value="🤖"
          onChange={mockOnChange}
          onGenerate={mockOnGenerate}
          canAutoGenerate={false}
        />
      </ThemeWrapper>
    );

    expect(screen.getByTitle('autoGenerateTooltipDisabled')).toBeInTheDocument();
  });
});