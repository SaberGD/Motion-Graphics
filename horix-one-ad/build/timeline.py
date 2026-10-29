# Single source of truth for the edit. Output is 1080x1920 @30fps.
# pieces: (src_start, src_end, speed)   camera keys: (u, cx, cy, zoom) in source px, u = 0..1 over the segment
RAW = '../capture/raw/'
VID = {
    'pix': RAW + 'pixel_poster/page@b307ed3553561c4b221e9dba2ce98c90.webm',
    'vec': RAW + 'vector_logo/page@5d57b3488491834b03a8c2e1943d1c4b.webm',
    'lay': RAW + 'layout_book/page@9f8b41dee84da43a8f226cab82e1624f.webm',
}
SEGS = [
    dict(id='ai', t=0.0, dur=3.5, src='pix', chip='Pixel',
         pieces=[(39.6, 42.4, 2.0), (42.4, 54.4, 12.0), (54.4, 55.5, 1.0)],
         cam=[(0, 360, 300, 1.55), (0.4, 470, 330, 1.5), (0.7, 578, 470, 1.3), (1, 578, 470, 1.55)]),
    dict(id='cut', t=3.5, dur=2.5, src='pix', chip='Pixel',
         pieces=[(69.9, 73.0, 3.0), (73.0, 80.0, 4.667)],
         cam=[(0, 578, 480, 1.3), (1, 578, 480, 1.3)]),
    dict(id='draw', t=6.0, dur=3.5, src='vec', chip='Vector',
         pieces=[(43.0, 68.0, 7.143)],
         cam=[(0, 570, 470, 1.25), (0.7, 570, 470, 1.25), (1, 650, 470, 1.25)]),
    dict(id='chords', t=9.5, dur=5.0, src='vec', chip='Vector',
         pieces=[(70.0, 77.0, 3.5), (77.0, 88.0, 7.333), (88.0, 109.0, 14.0)],
         cam=[(0, 930, 420, 1.9), (0.66, 930, 420, 1.9), (0.8, 700, 470, 1.35), (1, 680, 470, 1.25)]),
    dict(id='text', t=14.5, dur=3.0, src='vec', chip='Vector',
         pieces=[(118.0, 126.0, 8.0), (126.0, 146.0, 13.333), (146.0, 165.0, 38.0)],
         cam=[(0, 560, 470, 1.25), (1, 600, 470, 1.25)]),
    dict(id='handoff', t=17.5, dur=3.5, src='vec', chip='Vector>Pixel',
         pieces=[(168.0, 170.5, 2.5), (170.5, 177.5, 7.0), (177.5, 180.5, 2.0)],
         cam=[(0, 1000, 260, 1.6), (0.3, 1000, 260, 1.6), (0.55, 720, 450, 1.25), (1, 578, 480, 1.25)]),
    dict(id='poster', t=21.0, dur=4.0, src='pix', chip='Pixel',
         pieces=[(80.5, 90.0, 9.5), (90.0, 99.0, 9.0), (99.0, 107.0, 8.0), (111.0, 119.5, 8.5)],
         cam=[(0, 578, 470, 1.3), (0.7, 578, 470, 1.3), (0.85, 330, 330, 1.6), (1, 578, 480, 1.3)]),
    dict(id='book', t=25.0, dur=6.0, src='lay', chip='Layout', pad=True,
         pieces=[(50.0, 56.0, 6.0), (56.0, 71.5, 15.5), (84.0, 101.0, 8.5), (118.0, 147.5, 14.75)],
         cam=[(0, 720, 450, 1.0), (1, 720, 450, 1.0)]),
]
FINAL = dict(  # mockup montage + reveal (rendered separately)
    mockups=[('stills/m_poster.jpg', 31.0, 1.5), ('stills/m_booklet.jpg', 32.5, 1.0), ('stills/m_phone.jpg', 33.5, 1.0)],
    reveal=(34.5, 4.5), total=39.0)
