#!/usr/bin/env python3
"""把 portal/ 下的 index.html + styles.css + app.js + 两张图合成一个自包含的 portal.html。

用法:  python3 portal/build-single.py
输出:  portal/portal.html —— 双击即可用，不依赖同目录任何文件（可直接拷走/发人）。
"""

import base64
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'portal.html')


def read(name, binary=False):
    path = os.path.join(HERE, name)
    if not os.path.exists(path):
        sys.exit(f'✗ 缺少文件: {path}')
    mode = 'rb' if binary else 'r'
    kw = {} if binary else {'encoding': 'utf-8'}
    with io.open(path, mode, **kw) as f:
        return f.read()


def data_uri(name, mime):
    raw = read(name, binary=True)
    return 'data:%s;base64,%s' % (mime, base64.b64encode(raw).decode('ascii')), len(raw)


def sub_once(text, old, new, label):
    """替换且必须命中恰好一次，否则直接报错，避免静默产出坏文件。"""
    n = text.count(old)
    if n != 1:
        sys.exit(f'✗ 替换 {label} 命中 {n} 次（应为 1 次）：{old[:70]}')
    return text.replace(old, new)


def main():
    html = read('index.html')
    css = read('styles.css')
    js = read('app.js')
    logo_uri, logo_size = data_uri('main-logo-1x.png', 'image/png')
    fav_uri, fav_size = data_uri('favicon.png', 'image/png')

    # 1) 样式表内联
    html = sub_once(
        html,
        '<link rel="stylesheet" href="styles.css">',
        '<style>\n' + css.rstrip() + '\n</style>',
        'styles.css')

    # 2) 图标内联
    html = sub_once(
        html,
        '<link rel="icon" type="image/png" href="favicon.png">',
        '<link rel="icon" type="image/png" href="%s">' % fav_uri,
        'favicon.png')

    # 3) logo 内联（侧栏 + 主页面两处）
    n_logo = html.count('src="main-logo-1x.png"')
    if n_logo != 2:
        sys.exit(f'✗ logo 引用应为 2 处，实际 {n_logo} 处')
    html = html.replace('src="main-logo-1x.png"', 'src="%s"' % logo_uri)

    # 4) 脚本内联（顺手防止 JS 里出现 </script> 提前闭合）
    js_safe = js.replace('</script', '<\\/script')
    html = sub_once(
        html,
        '<script src="app.js"></script>',
        '<script>\n' + js_safe.rstrip() + '\n</script>',
        'app.js')

    # 5) 头部加一段生成说明
    note = (
        '<!--\n'
        '  单文件版 PolyU Portal（由 portal/build-single.py 自动生成，请勿手改）\n'
        '  源文件: index.html + styles.css + app.js + main-logo-1x.png + favicon.png\n'
        '  logo %d bytes / favicon %d bytes 已转 base64 内嵌，整份文件不依赖任何外部资源。\n'
        '  重新生成: python3 portal/build-single.py\n'
        '-->\n' % (logo_size, fav_size)
    )
    html = html.replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n' + note, 1)

    # 6) 出厂自检：不能再有任何指向本地文件的引用
    leftovers = re.findall(r'(?:href|src)="(?!#|data:|https?:|mailto:)([^"]+)"', html)
    if leftovers:
        sys.exit(f'✗ 仍有外部引用未内联: {leftovers}')

    with io.open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)

    size = os.path.getsize(OUT)
    print('✓ 已生成 %s' % os.path.relpath(OUT, os.path.dirname(HERE)))
    print('  合计 %.0f KB  (html %d + css %d + js %d + logo %d + favicon %d)'
          % (size / 1024, len(read('index.html')), len(css), len(js), logo_size, fav_size))
    print('  内嵌后 base64 膨胀：logo %d -> %d，favicon %d -> %d'
          % (logo_size, len(logo_uri), fav_size, len(fav_uri)))
    print('  外部引用检查：0 处（只有 data:/https: 链接）')


if __name__ == '__main__':
    main()
