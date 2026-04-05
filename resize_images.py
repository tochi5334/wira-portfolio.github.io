"""
画像リサイズスクリプト
大きな画像をWeb表示用に最適化します

使い方:
  python resize_images.py

オプション:
  --max-width 2000   最大幅（デフォルト: 2000px）
  --quality 85       JPEG品質（デフォルト: 85）
  --backup           元ファイルをバックアップ
"""

import os
import sys
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillowがインストールされていません。")
    print("インストールコマンド: pip install Pillow")
    sys.exit(1)

# 設定
MAX_WIDTH = 2000        # 最大幅（ピクセル）
MAX_HEIGHT = 2000       # 最大高さ（ピクセル）
JPEG_QUALITY = 85       # JPEG品質（1-100）
MAX_FILE_SIZE_MB = 5    # 目標最大ファイルサイズ（MB）
CREATE_BACKUP = True    # バックアップを作成するか

# 対象フォルダ
GALLERY_FOLDERS = [
    "images/gallery/starrail",
    "images/gallery/other",
]

def safe_print(msg):
    """Windows cp932エンコーディングでも安全に出力"""
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'))

def get_file_size_mb(path):
    """ファイルサイズをMBで取得"""
    return os.path.getsize(path) / (1024 * 1024)

def resize_image(input_path, output_path, max_width, max_height, quality):
    """画像をリサイズして保存"""
    try:
        with Image.open(input_path) as img:
            original_size = img.size
            original_mode = img.mode
            
            # RGBA画像をRGBに変換（JPEG保存用）
            if img.mode in ('RGBA', 'P'):
                # 白背景で合成
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # リサイズが必要かチェック
            width, height = img.size
            if width > max_width or height > max_height:
                # アスペクト比を維持してリサイズ
                ratio = min(max_width / width, max_height / height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                safe_print(f"  Resize: {original_size} -> {new_size}")
            
            # JPEG形式で保存
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            return True
            
    except Exception as e:
        safe_print(f"  Error: {e}")
        return False

def process_folder(folder_path, max_width, max_height, quality, backup):
    """フォルダ内の画像を処理"""
    if not os.path.exists(folder_path):
        safe_print(f"Folder not found: {folder_path}")
        return
    
    safe_print(f"\nProcessing: {folder_path}")
    safe_print("-" * 50)
    
    # バックアップフォルダ
    if backup:
        backup_folder = os.path.join(folder_path, "_backup")
        os.makedirs(backup_folder, exist_ok=True)
    
    # 対象拡張子
    extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}
    
    processed = 0
    skipped = 0
    
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        
        # ファイルのみ処理
        if not os.path.isfile(filepath):
            continue
        
        # 拡張子チェック
        ext = os.path.splitext(filename)[1].lower()
        if ext not in extensions:
            continue
        
        file_size_mb = get_file_size_mb(filepath)
        
        # 5MB以下はスキップ
        if file_size_mb <= MAX_FILE_SIZE_MB:
            safe_print(f"[OK] {filename} ({file_size_mb:.1f}MB) - skip")
            skipped += 1
            continue
        
        safe_print(f"-> {filename} ({file_size_mb:.1f}MB)")
        
        # バックアップ
        if backup:
            backup_path = os.path.join(backup_folder, filename)
            if not os.path.exists(backup_path):
                shutil.copy2(filepath, backup_path)
                safe_print(f"  Backup: _backup/{filename}")
        
        # 新しいファイル名（JPEGに変換）
        new_filename = os.path.splitext(filename)[0] + ".jpg"
        new_filepath = os.path.join(folder_path, new_filename)
        
        # リサイズ処理
        if resize_image(filepath, new_filepath, max_width, max_height, quality):
            new_size_mb = get_file_size_mb(new_filepath)
            safe_print(f"  Saved: {new_filename} ({new_size_mb:.1f}MB)")
            
            # 元のファイルがPNGなら削除
            if ext == '.png' and filepath != new_filepath:
                os.remove(filepath)
                safe_print(f"  Deleted: {filename}")
            
            processed += 1
        else:
            safe_print(f"  Failed: {filename}")
    
    safe_print(f"\nDone: {processed} processed, {skipped} skipped")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='画像リサイズスクリプト')
    parser.add_argument('--max-width', type=int, default=MAX_WIDTH, help='最大幅')
    parser.add_argument('--max-height', type=int, default=MAX_HEIGHT, help='最大高さ')
    parser.add_argument('--quality', type=int, default=JPEG_QUALITY, help='JPEG品質')
    parser.add_argument('--no-backup', action='store_true', help='バックアップなし')
    
    args = parser.parse_args()
    
    print("=" * 50)
    print("画像リサイズスクリプト")
    print("=" * 50)
    print(f"設定: 最大 {args.max_width}x{args.max_height}px, 品質 {args.quality}")
    print(f"5MB以上のファイルのみ処理します")
    
    # スクリプトのディレクトリを基準にする
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    for folder in GALLERY_FOLDERS:
        folder_path = os.path.join(script_dir, folder)
        process_folder(folder_path, args.max_width, args.max_height, 
                      args.quality, not args.no_backup)
    
    print("\n" + "=" * 50)
    print("すべての処理が完了しました！")
    print("config.js のファイル名を更新してください（.PNG → .jpg）")
    print("=" * 50)

if __name__ == "__main__":
    main()
