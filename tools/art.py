# Draws the pictures in mods/crest/art/: small scenes for spaces with no picture of their own (flowers, plants,
# fruit, sky). Hand-placed shapes, no filters, so any SVG renderer shows them the same. Writes the files, and
# with a second path a preview sheet of all of them:
#   python3 tools/art.py mods/crest/art [sheet.svg]
import math, os, sys
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def svg(body, bg):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="{bg}"/>{body}</svg>\n'

def ring(n, rx, ry, cy, fill, cx=32, ccy=32):
    return f'<g transform="translate({cx} {ccy})" fill="{fill}">' + "".join(
        f'<ellipse rx="{rx}" ry="{ry}" cy="{cy}" transform="rotate({i*360/n:.1f})"/>' for i in range(n)) + '</g>'

ART = {}

ART["tulip"] = svg(
 '<path d="M32 31 C32 41 32 49 32 58" stroke="#4E7D57" stroke-width="3" fill="none" stroke-linecap="round"/>'
 '<path d="M32 51 C24 49 17 41 17 32 C25 34 31 41 32 51Z" fill="#6F9F6C"/>'
 '<path d="M32 47 C40 45 46 39 47 31 C40 33 34 39 32 47Z" fill="#5B8A5C"/>'
 '<path d="M21 13 C21 26 25 33 32 33 C39 33 43 26 43 13 L37.5 19 L32 10 L26.5 19 Z" fill="#E2645B"/>'
 '<path d="M32 10 L26.5 19 C26.5 27 29 32 32 33 C35 32 37.5 27 37.5 19 Z" fill="#C8464A"/>', "#F2DCD5")

ART["monstera"] = svg(
 '<path d="M31 60 C31 52 31.5 46 32 39" stroke="#3F6B4A" stroke-width="2.6" stroke-linecap="round" fill="none"/>'
 '<path d="M32 41 C17 41 8 31 9 19 C10 9 21 5 32 9 C43 5 54 9 55 19 C56 31 47 41 32 41Z" fill="#3E7550"/>'
 '<path d="M32 10 L32 39" stroke="#2D5C3D" stroke-width="1.6"/>'
 '<g stroke="#DDE6D5" stroke-width="3.2" stroke-linecap="round"><path d="M8 19 L23 22"/><path d="M11 30 L24 27.5"/><path d="M56 19 L41 22"/><path d="M53 30 L40 27.5"/></g>', "#DDE6D5")

ART["lemon"] = svg(
 '<circle cx="32" cy="32" r="21" fill="#E6BB36"/><circle cx="32" cy="32" r="17.5" fill="#FBF3D2"/><circle cx="32" cy="32" r="15.8" fill="#F4D45C"/>'
 '<g stroke="#FBF3D2" stroke-width="1.9" stroke-linecap="round">' + "".join(
   f'<path d="M32 32 L{32+15*math.cos(math.radians(a)):.2f} {32+15*math.sin(math.radians(a)):.2f}"/>' for a in range(0,360,45)) +
 '</g><circle cx="32" cy="32" r="2.4" fill="#FBF3D2"/>', "#F1E5BF")

ART["moon"] = svg(
 '<circle cx="36" cy="24" r="12" fill="#F3E3B3"/><circle cx="41.5" cy="19.5" r="10.5" fill="#2E3B5E"/>'
 '<circle cx="15" cy="14" r="1.3" fill="#F3E3B3"/><circle cx="51" cy="38" r="1" fill="#F3E3B3"/><circle cx="21" cy="31" r="0.9" fill="#F3E3B3"/><circle cx="54" cy="10" r="0.8" fill="#F3E3B3"/>'
 '<path d="M0 46 Q8 42 16 46 T32 46 T48 46 T64 46 V64 H0Z" fill="#46608E"/>'
 '<path d="M0 53 Q8 49 16 53 T32 53 T48 53 T64 53 V64 H0Z" fill="#6884B2"/>', "#2E3B5E")

ART["hills"] = svg(
 '<circle cx="41" cy="25" r="10" fill="#EE8B52"/>'
 '<path d="M0 43 C14 33 26 35 38 41 C48 45 56 39 64 37 V64 H0Z" fill="#AAC596"/>'
 '<path d="M0 51 C12 43 24 45 34 49 C46 54 54 47 64 46 V64 H0Z" fill="#76A273"/>'
 '<path d="M0 58 C16 53 30 55 44 57 C52 58 58 56 64 55 V64 H0Z" fill="#557F5C"/>', "#F7DCC4")

ART["mountain"] = svg(
 '<circle cx="47" cy="16" r="5" fill="#F6EFE2"/>'
 '<path d="M2 54 L25 19 L35 33 L42 25 L63 54Z" fill="#5D7490"/>'
 '<path d="M25 19 L19.5 27.5 L23.5 26.5 L26.5 29.5 L30.5 26 Z" fill="#F4F1EA"/>'
 '<path d="M42 25 L38.5 30.5 L41.5 29.5 L44 32 L46.5 29.8Z" fill="#F4F1EA"/>'
 '<path d="M0 52 C16 49 30 51 44 50 C52 49.5 58 50 64 51 V64 H0Z" fill="#8EA79E"/>', "#D7E1EA")

ART["daisy"] = svg(
 '<path d="M32 40 C33 48 33 54 32 61" stroke="#55805A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
 '<path d="M32.5 52 C38 49 43 50 46 53 C41 56 36 55 32.5 52Z" fill="#6E9A6B"/>'
 + ring(12, 3.6, 9, -10, "#FFFDF6", 32, 27) +
 '<circle cx="32" cy="27" r="6.2" fill="#EDB83C"/><circle cx="30" cy="25" r="1.6" fill="#F6D27A"/>', "#D3DFCB")

ART["cherry"] = svg(
 '<path d="M35 11 C30 19 25 28 22 37" stroke="#5B7D4E" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
 '<path d="M35 11 C38 21 41 30 43 39" stroke="#5B7D4E" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
 '<path d="M35 11 C41 6.5 48 7.5 51 12.5 C45 15 40 14.5 35 11Z" fill="#7DA56A"/>'
 '<circle cx="22" cy="44" r="9.2" fill="#C8373F"/><circle cx="43.5" cy="46" r="9.2" fill="#AE2A36"/>'
 '<circle cx="18.6" cy="40.6" r="2.3" fill="#F29A97" opacity=".75"/><circle cx="40" cy="42.6" r="2.3" fill="#F29A97" opacity=".75"/>', "#F4DCDA")

ART["mushroom"] = svg(
 '<path d="M0 54 C14 52 28 53 40 52.5 C50 52 58 53 64 54 V64 H0Z" fill="#B7C8A0"/>'
 '<path d="M26 35 C25 43 25 49 26.5 54 H37.5 C39 49 39 43 38 35Z" fill="#F7F0E2"/>'
 '<path d="M9 38 C9 24 19 13 32 13 C45 13 55 24 55 38 C47 35.5 17 35.5 9 38Z" fill="#D9493F"/>'
 '<g fill="#F7F0E2"><circle cx="22" cy="25" r="3.2"/><circle cx="35" cy="20" r="2.5"/><circle cx="45" cy="29" r="2.9"/><circle cx="31" cy="30" r="2"/><circle cx="15" cy="33" r="1.6"/></g>', "#EFE5D3")

ART["cactus"] = svg(
 '<g fill="#5E9467"><rect x="27" y="15" width="10" height="31" rx="5"/>'
 '<path d="M27 35 H23 C19.5 35 18 33 18 30 V24.5 C18 21.5 22.5 21.5 22.5 24.5 V30.5 H27Z"/>'
 '<path d="M37 31 H41.5 V26 C41.5 23 46 23 46 26 V31 C46 34.5 44 36.5 40.5 36.5 H37Z"/></g>'
 '<path d="M32 18 V44" stroke="#4A7A53" stroke-width="1.2"/>'
 '<path d="M20 45 H44 L41 59 H23Z" fill="#C8704E"/><rect x="18" y="42" width="28" height="5.5" rx="1.6" fill="#B25E40"/>', "#ECDFCB")

def seigaiha():
    rows = []
    for j, y in enumerate([14, 24, 34, 44, 54, 64, 74]):
        off = 10 if j % 2 else 0
        for x in range(-10 + off, 80, 20):
            rows.append(f'<circle cx="{x}" cy="{y}" r="11"/><circle cx="{x}" cy="{y}" r="7.2"/><circle cx="{x}" cy="{y}" r="3.4"/>')
    return f'<g fill="#E1ECEF" stroke="#3F7494" stroke-width="1.9">{"".join(rows)}</g>'
ART["waves"] = svg(seigaiha(), "#E1ECEF")

def olive():
    body = '<path d="M13 54 C23 42 34 29 51 13" stroke="#6B7A4F" stroke-width="2" fill="none" stroke-linecap="round"/>'
    leaves = [(19,44,-75),(25,44,10),(27,35,-70),(33,35,15),(35,26,-62),(41,27,20),(43,19,-55),(49,19,25)]
    body += "".join(f'<ellipse cx="{x}" cy="{y}" rx="7.5" ry="2.9" transform="rotate({a} {x} {y})" fill="#8C9C66"/>' for x,y,a in leaves)
    body += '<circle cx="22" cy="49" r="3.4" fill="#4C513B"/><circle cx="38" cy="31" r="3.2" fill="#5A5F44"/>'
    return body
ART["olive"] = svg(olive(), "#E5E7DF")

ART["pear"] = svg(
 '<path d="M32 15 C32 11 33 8 35 6" stroke="#6A5A3E" stroke-width="2" fill="none" stroke-linecap="round"/>'
 '<path d="M33.5 10 C37.5 6 43.5 6 45.5 9.5 C41.5 12.5 37.5 12.5 33.5 10Z" fill="#7FA05E"/>'
 '<path d="M32 14 C28 14 27 20 27 24 C27 28 19 33 19 43 C19 52 25 57.5 32 57.5 C39 57.5 45 52 45 43 C45 33 37 28 37 24 C37 20 36 14 32 14Z" fill="#C9C26A"/>'
 '<ellipse cx="26" cy="42" rx="3" ry="5.5" fill="#E6E197" opacity=".75"/>', "#E4DDEB")

ART["sunflower"] = svg(
 '<path d="M32 44 C33 51 33 56 32 62" stroke="#557F4F" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
 + ring(16, 3.3, 9.5, -12, "#F0B92E", 32, 30) + ring(16, 2.6, 7, -11, "#E39B22", 32, 30) +
 '<circle cx="32" cy="30" r="8.4" fill="#6B4A2E"/><circle cx="32" cy="30" r="5" fill="#57391F"/>', "#C9D7E8")

ART["cloud"] = svg(
 '<g fill="#FBFBFA"><circle cx="24" cy="29" r="9"/><circle cx="36" cy="24" r="11"/><circle cx="45.5" cy="31" r="7.5"/><rect x="15" y="29" width="38" height="10" rx="5"/></g>'
 '<g stroke="#6F90B6" stroke-width="2.6" stroke-linecap="round"><path d="M23 46 l-2 6"/><path d="M32 46 l-2 6"/><path d="M41 46 l-2 6"/><path d="M27.5 54 l-1.5 4.5"/><path d="M36.5 54 l-1.5 4.5"/></g>', "#D4DCE5")

def ginkgo():
    body = '<path d="M32 58 C32 50 32 44 32 38" stroke="#9B8A3C" stroke-width="2.2" stroke-linecap="round" fill="none"/>'
    body += '<path d="M32 39 C21 39 11 31 9 18 C17 11.5 26 10.5 30 14 L32 22 L34 14 C38 10.5 47 11.5 55 18 C53 31 43 39 32 39Z" fill="#E3B93A"/>'
    body += '<g stroke="#F2D777" stroke-width="1" opacity=".9">' + "".join(
        f'<path d="M32 38 L{32+24*math.cos(math.radians(a)):.1f} {38-24*math.sin(math.radians(a)):.1f}"/>' for a in [150,132,114,66,48,30]) + '</g>'
    return body
ART["ginkgo"] = svg(ginkgo(), "#EFE8D2")

def sparkle(x, y, r, c):
    k = r * 0.18
    return f'<path d="M{x} {y-r} C{x+k} {y-k} {x+k} {y-k} {x+r} {y} C{x+k} {y+k} {x+k} {y+k} {x} {y+r} C{x-k} {y+k} {x-k} {y+k} {x-r} {y} C{x-k} {y-k} {x-k} {y-k} {x} {y-r}Z" fill="{c}"/>'
ART["stars"] = svg(
 sparkle(24, 26, 11, "#F5E3A8") + sparkle(43, 41, 7, "#E9D3F1") + sparkle(45, 17, 4, "#F5E3A8") + sparkle(17, 47, 3.5, "#E9D3F1")
 + '<circle cx="54" cy="52" r="1" fill="#F5E3A8"/><circle cx="10" cy="12" r="1" fill="#F5E3A8"/>', "#3A3354")

def shell():
    body = '<path d="M32 54 L10 30 C12 17 21 10 32 10 C43 10 52 17 54 30 Z" fill="#EAB79D"/>'
    body += '<g stroke="#D58F74" stroke-width="1.6">' + "".join(
        f'<path d="M32 53 L{32+23*math.cos(math.radians(a)):.1f} {32-23*math.sin(math.radians(a)):.1f}"/>' for a in [160,140,120,100,80,60,40,20]) + '</g>'
    body += '<path d="M25 52 H39 L37 57 H27Z" fill="#D9997E"/>'
    return body
ART["shell"] = svg(shell(), "#EFE3D3")

for name, text in ART.items():
    open(os.path.join(OUT, f"{name}.svg"), "w").write(text)

# preview sheet: each tile at 64 and at 24, rounded
names = list(ART)
cols = 6
cell = 84
rows = math.ceil(len(names) / cols)
parts = []
for i, n in enumerate(names):
    x, y = (i % cols) * cell + 10, (i // cols) * cell + 10
    inner = ART[n].split('viewBox="0 0 64 64">',1)[1].rsplit('</svg>',1)[0]
    parts.append(f'<clipPath id="c{i}"><rect x="{x}" y="{y}" width="64" height="64" rx="14"/></clipPath><g clip-path="url(#c{i})"><g transform="translate({x} {y})">{inner}</g></g>')
sheet = f'<svg xmlns="http://www.w3.org/2000/svg" width="{cols*cell+10}" height="{rows*cell+10}" viewBox="0 0 {cols*cell+10} {rows*cell+10}"><rect width="100%" height="100%" fill="#1d1d1f"/>{"".join(parts)}</svg>'
if len(sys.argv) > 2:
    open(sys.argv[2], "w").write(sheet)
print(len(names), "pictures:", ", ".join(names))
