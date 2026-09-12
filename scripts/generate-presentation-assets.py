#!/usr/bin/env python3
"""Generate PNG assets for the YogaTracker presentation."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "docs" / "presentation-assets"

PRIMARY = (45, 106, 79)
PRIMARY_LIGHT = (64, 155, 110)
ACCENT = (149, 213, 178)
PALE = (216, 243, 220)
DARK = (27, 67, 50)
BG = (248, 250, 249)
WHITE = (255, 255, 255)
GRAY = (92, 107, 100)
VIDEO_BG = (17, 24, 39)
SKELETON = (45, 255, 145)

POSE_CONNECTIONS = [
    (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24), (23, 25), (24, 26),
    (25, 27), (26, 28),
]

# Normalized 0-100 landmarks for mock poses (x, y)
POSES = {
    "push-up": {
        0: (50, 18), 11: (38, 28), 12: (62, 28), 13: (32, 38), 14: (68, 38),
        15: (28, 48), 16: (72, 48), 23: (42, 52), 24: (58, 52),
        25: (40, 68), 26: (60, 68), 27: (38, 82), 28: (62, 82),
    },
    "tree": {
        0: (50, 12), 11: (41, 22), 12: (59, 22), 13: (45, 30), 14: (55, 30),
        15: (48, 36), 16: (52, 36), 23: (41, 50), 24: (59, 50),
        25: (41, 72), 26: (70, 58), 27: (41, 92), 28: (52, 64),
    },
    "mountain": {
        0: (50, 10), 11: (38, 20), 12: (62, 20), 13: (34, 34), 14: (66, 34),
        15: (32, 48), 16: (68, 48), 23: (40, 50), 24: (60, 50),
        25: (40, 70), 26: (60, 70), 27: (40, 90), 28: (60, 90),
    },
}


def font(size: int, bold: bool = False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def draw_skeleton(draw: ImageDraw.ImageDraw, landmarks: dict, ox: int, oy: int, w: int, h: int, scale: float = 1.0):
    def pt(i):
        x, y = landmarks[i]
        return ox + int(x / 100 * w * scale), oy + int(y / 100 * h * scale)

    for a, b in POSE_CONNECTIONS:
        if a in landmarks and b in landmarks:
            draw.line([pt(a), pt(b)], fill=SKELETON, width=max(3, int(4 * scale)))
    for i, _ in landmarks.items():
        x, y = pt(i)
        r = max(4, int(6 * scale))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=SKELETON)


def save_logo():
    img = Image.new("RGB", (512, 512), PRIMARY)
    draw = ImageDraw.Draw(img)
    cx, cy = 256, 256
    draw.ellipse([cx - 36, 120 - 36, cx + 36, 120 + 36], fill=PALE)
    draw.line([cx, 156, cx, 280], fill=PALE, width=24)
    draw.line([cx, 200, 160, 260], fill=PALE, width=24)
    draw.line([cx, 200, 352, 260], fill=PALE, width=24)
    draw.line([cx, 280, 180, 400], fill=PALE, width=24)
    draw.line([cx, 280, 332, 400], fill=PALE, width=24)
    img.save(ASSETS / "logo.png")


def save_session_screen():
    w, h = 1280, 720
    img = Image.new("RGB", (w, h), VIDEO_BG)
    draw = ImageDraw.Draw(img)

    # Simulated person silhouette area
    draw_skeleton(draw, POSES["push-up"], 0, 80, w, h - 160, scale=1.1)

    # Live badge
    draw.rounded_rectangle([24, 24, 120, 56], radius=8, fill=(255, 255, 255, 200))
    draw.ellipse([36, 36, 48, 48], fill=(34, 197, 94))
    draw.text((56, 32), "Live", fill=DARK, font=font(18, True))

    # Metrics overlay (bottom left)
    draw.rounded_rectangle([24, h - 130, 380, h - 24], radius=12, fill=(255, 255, 255, 230))
    draw.text((40, h - 118), "Form score", fill=GRAY, font=font(14))
    draw.text((40, h - 98), "87%", fill=PRIMARY, font=font(36, True))
    draw.text((140, h - 98), "Reps: 8", fill=DARK, font=font(22, True))

    # Exercise demo panel (bottom right)
    draw.rounded_rectangle([w - 340, h - 200, w - 24, h - 24], radius=12, fill=WHITE)
    draw.rectangle([w - 340, h - 200, w - 24, h - 168], fill=PALE)
    draw.text((w - 324, h - 194), "Push-up", fill=PRIMARY, font=font(16, True))
    demo_x, demo_y = w - 320, h - 155
    draw.rounded_rectangle([demo_x, demo_y, demo_x + 90, demo_y + 110], radius=8, fill=VIDEO_BG)
    mini = ImageDraw.Draw(img)
    draw_skeleton(mini, POSES["push-up"], demo_x, demo_y, 90, 110, scale=0.35)
    draw.text((demo_x + 100, demo_y + 10), "1. Hands under shoulders", fill=DARK, font=font(11))
    draw.text((demo_x + 100, demo_y + 28), "2. Body in straight line", fill=DARK, font=font(11))
    draw.text((demo_x + 100, demo_y + 46), "3. Lower chest to floor", fill=DARK, font=font(11))

    img.save(ASSETS / "session-screen.png")


def save_dashboard_screen():
    w, h = 1280, 720
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)

    draw.text((48, 36), "Dashboard", fill=DARK, font=font(32, True))
    draw.text((48, 78), "Track your practice streaks and accuracy", fill=GRAY, font=font(16))

    # Streak card
    draw.rounded_rectangle([48, 110, 280, 200], radius=16, fill=WHITE, outline=PALE, width=2)
    draw.text((68, 130), "Current streak", fill=GRAY, font=font(14))
    draw.text((68, 152), "5 days", fill=PRIMARY, font=font(28, True))

    # Stats cards
    for i, (label, val) in enumerate([("Sessions", "12"), ("Avg form", "84%"), ("Total reps", "156")]):
        x = 300 + i * 200
        draw.rounded_rectangle([x, 110, x + 180, 200], radius=16, fill=WHITE, outline=PALE, width=2)
        draw.text((x + 20, 130), label, fill=GRAY, font=font(14))
        draw.text((x + 20, 152), val, fill=DARK, font=font(26, True))

    # Chart area
    draw.rounded_rectangle([48, 230, w - 48, 480], radius=16, fill=WHITE, outline=PALE, width=2)
    draw.text((68, 250), "Weekly activity", fill=DARK, font=font(18, True))
    bars = [60, 90, 45, 120, 80, 100, 70]
    for i, bh in enumerate(bars):
        bx = 100 + i * 140
        draw.rectangle([bx, 430 - bh, bx + 60, 430], fill=PRIMARY_LIGHT)

    # Recent sessions
    draw.rounded_rectangle([48, 500, w - 48, h - 40], radius=16, fill=WHITE, outline=PALE, width=2)
    draw.text((68, 520), "Recent sessions", fill=DARK, font=font(18, True))
    rows = [("Push-up", "8 reps · 82%"), ("Tree Pose", "45s hold · 91%"), ("Squat", "12 reps · 78%")]
    for i, (name, meta) in enumerate(rows):
        y = 560 + i * 44
        draw.text((68, y), name, fill=DARK, font=font(15, True))
        draw.text((280, y), meta, fill=GRAY, font=font(14))

    img.save(ASSETS / "dashboard-screen.png")


def save_landing_screen():
    w, h = 1280, 720
    img = Image.new("RGB", (w, h), PALE)
    draw = ImageDraw.Draw(img)

    draw.text((80, 120), "Track your form", fill=DARK, font=font(44, True))
    draw.text((80, 175), "while you work out", fill=PRIMARY, font=font(44, True))
    draw.text((80, 250), "Pick an exercise, turn on your camera,", fill=GRAY, font=font(18))
    draw.text((80, 275), "and get live feedback on posture and reps.", fill=GRAY, font=font(18))

    draw.rounded_rectangle([80, 330, 240, 390], radius=24, fill=PRIMARY)
    draw.text((108, 348), "Create account", fill=WHITE, font=font(18, True))

    # Preview window
    draw.rounded_rectangle([620, 80, 1180, 520], radius=16, fill=VIDEO_BG)
    inner = ImageDraw.Draw(img)
    draw_skeleton(inner, POSES["mountain"], 620, 80, 560, 440, scale=0.9)
    draw.rounded_rectangle([640, 460, 760, 500], radius=8, fill=WHITE)
    draw.text((660, 472), "87% form", fill=PRIMARY, font=font(16, True))

    img.save(ASSETS / "landing-screen.png")


def save_architecture():
    w, h = 1200, 680
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    def box(x, y, bw, bh, title, lines, fill=PALE):
        draw.rounded_rectangle([x, y, x + bw, y + bh], radius=12, fill=fill, outline=PRIMARY, width=2)
        draw.text((x + 16, y + 14), title, fill=PRIMARY, font=font(18, True))
        for i, line in enumerate(lines):
            draw.text((x + 16, y + 44 + i * 22), line, fill=DARK, font=font(13))

    box(80, 60, 1040, 120, "Browser — Next.js App", [
        "Webcam · MediaPipe PoseLandmarker · Skeleton overlay · Coaching UI",
        "Pages: Session, Dashboard, Onboarding, Plan, Progress",
    ])

    draw.polygon([(600, 200), (580, 240), (620, 240)], fill=PRIMARY)
    draw.text((540, 248), "HTTPS / JWT", fill=GRAY, font=font(12))

    box(80, 280, 480, 160, "Supabase Auth", [
        "Email signup & login",
        "Session cookies via middleware",
    ], fill=(240, 248, 244))

    box(640, 280, 480, 160, "REST API Routes", [
        "/api/sessions · /api/exercises",
        "/api/analytics · /api/plan",
    ], fill=(240, 248, 244))

    draw.line([(320, 440), (320, 480), (600, 480), (600, 520)], fill=PRIMARY, width=3)
    draw.line([(880, 440), (880, 480), (600, 480)], fill=PRIMARY, width=3)

    box(80, 520, 1040, 130, "Supabase PostgreSQL", [
        "profiles · exercises · sessions · workout_plans · exercise_logs · progress_logs",
        "Row Level Security — users access only their own rows",
    ])

    img.save(ASSETS / "architecture.png")


def save_pose_grid():
    w, h = 900, 320
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)
    poses = [("Push-up", "push-up"), ("Tree Pose", "tree"), ("Mountain", "mountain")]
    for i, (label, key) in enumerate(poses):
        x = 30 + i * 290
        draw.rounded_rectangle([x, 20, x + 260, h - 20], radius=12, fill=VIDEO_BG)
        draw_skeleton(draw, POSES[key], x, 20, 260, h - 60, scale=0.85)
        draw.text((x + 80, h - 42), label, fill=WHITE, font=font(16, True))
    img.save(ASSETS / "pose-grid.png")


def save_flow_diagram():
    w, h = 1100, 200
    img = Image.new("RGB", (w, h), WHITE)
    draw = ImageDraw.Draw(img)
    steps = ["Camera", "Pick exercise", "Track pose", "Score form", "Save session"]
    for i, step in enumerate(steps):
        x = 20 + i * 210
        draw.rounded_rectangle([x, 60, x + 170, 140], radius=10, fill=PALE, outline=PRIMARY, width=2)
        draw.text((x + 20, 88), f"{i + 1}. {step}", fill=DARK, font=font(14, True))
        if i < len(steps) - 1:
            draw.polygon([(x + 178, 95), (x + 198, 100), (x + 178, 105)], fill=PRIMARY)
    img.save(ASSETS / "flow-diagram.png")


def build_all() -> Path:
    ASSETS.mkdir(parents=True, exist_ok=True)
    save_logo()
    save_session_screen()
    save_dashboard_screen()
    save_landing_screen()
    save_architecture()
    save_pose_grid()
    save_flow_diagram()
    return ASSETS


if __name__ == "__main__":
    path = build_all()
    print(f"Assets saved to: {path}")
