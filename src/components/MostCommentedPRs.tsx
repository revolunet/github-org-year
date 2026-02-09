import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { MostCommentedPR } from "../types.ts";

interface MostCommentedPRsProps {
  prs: MostCommentedPR[];
}

const CYCLE_MS = 5_000;
const FADE_MS = 300;

const EMOJI_MAP: Record<string, string> = {
  construction: "\u{1F6A7}",
  bug: "\u{1F41B}",
  fire: "\u{1F525}",
  sparkles: "\u{2728}",
  rocket: "\u{1F680}",
  memo: "\u{1F4DD}",
  art: "\u{1F3A8}",
  zap: "\u{26A1}",
  tada: "\u{1F389}",
  white_check_mark: "\u{2705}",
  lock: "\u{1F512}",
  bookmark: "\u{1F516}",
  rotating_light: "\u{1F6A8}",
  ambulance: "\u{1F691}",
  lipstick: "\u{1F484}",
  boom: "\u{1F4A5}",
  wrench: "\u{1F527}",
  hammer: "\u{1F528}",
  package: "\u{1F4E6}",
  truck: "\u{1F69A}",
  apple: "\u{1F34E}",
  penguin: "\u{1F427}",
  checkered_flag: "\u{1F3C1}",
  robot: "\u{1F916}",
  green_heart: "\u{1F49A}",
  arrow_down: "\u{2B07}\u{FE0F}",
  arrow_up: "\u{2B06}\u{FE0F}",
  pushpin: "\u{1F4CC}",
  construction_worker: "\u{1F477}",
  chart_with_upwards_trend: "\u{1F4C8}",
  recycle: "\u{267B}\u{FE0F}",
  heavy_plus_sign: "\u{2795}",
  heavy_minus_sign: "\u{2796}",
  globe_with_meridians: "\u{1F310}",
  pencil2: "\u{270F}\u{FE0F}",
  poop: "\u{1F4A9}",
  rewind: "\u{23EA}",
  twisted_rightwards_arrows: "\u{1F500}",
  card_file_box: "\u{1F5C3}\u{FE0F}",
  loud_sound: "\u{1F50A}",
  mute: "\u{1F507}",
  busts_in_silhouette: "\u{1F465}",
  children_crossing: "\u{1F6B8}",
  building_construction: "\u{1F3D7}\u{FE0F}",
  iphone: "\u{1F4F1}",
  clown_face: "\u{1F921}",
  egg: "\u{1F95A}",
  see_no_evil: "\u{1F648}",
  camera_flash: "\u{1F4F8}",
  alembic: "\u{2697}\u{FE0F}",
  mag: "\u{1F50D}",
  label: "\u{1F3F7}\u{FE0F}",
  seedling: "\u{1F331}",
  triangular_flag_on_post: "\u{1F6A9}",
  goal_net: "\u{1F945}",
  dizzy: "\u{1F4AB}",
  wastebasket: "\u{1F5D1}\u{FE0F}",
  passport_control: "\u{1F6C2}",
  adhesive_bandage: "\u{1FA79}",
  monocle_face: "\u{1F9D0}",
  coffin: "\u{26B0}\u{FE0F}",
  test_tube: "\u{1F9EA}",
  necktie: "\u{1F454}",
  stethoscope: "\u{1FA7A}",
  bricks: "\u{1F9F1}",
  technologist: "\u{1F9D1}\u{200D}\u{1F4BB}",
  money_with_wings: "\u{1F4B8}",
  thread: "\u{1F9F5}",
  safety_vest: "\u{1F9BA}",
  mag_right: "\u{1F50E}",
};

function replaceEmojiShortcodes(text: string): string {
  return text.replace(/:([a-z0-9_+-]+):/g, (match, code: string) => {
    return EMOJI_MAP[code] ?? match;
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MostCommentedPRs({ prs }: MostCommentedPRsProps) {
  const shuffled = useMemo(() => shuffle(prs), [prs]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadingRef = useRef(false);

  const cycle = useCallback(() => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    setVisible(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % shuffled.length);
      setVisible(true);
      fadingRef.current = false;
    }, FADE_MS);
  }, [shuffled.length]);

  const resetTimer = useCallback(() => {
    if (cycleRef.current) clearInterval(cycleRef.current);
    cycleRef.current = setInterval(cycle, CYCLE_MS);
  }, [cycle]);

  useEffect(() => {
    if (shuffled.length <= 1) return;
    cycleRef.current = setInterval(cycle, CYCLE_MS);
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [shuffled.length, cycle]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("a")) return;
      if (shuffled.length <= 1) return;
      cycle();
      resetTimer();
    },
    [cycle, resetTimer, shuffled.length],
  );

  if (shuffled.length === 0) return null;

  const pr = shuffled[index];

  return (
    <section onClick={handleClick} className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-red-800 text-white rounded-xl p-6 sm:p-8 shadow-lg shadow-blue-500/25 cursor-pointer">
      {/* Animated tricolore glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(120deg, #002395, #4a5ebd, #ffffff, #e85050, #ED2939)",
          backgroundSize: "300% 100%",
          animation: "tricolore 8s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes tricolore {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <span className="text-2xl">💬</span> Most Commented PRs
          </h2>
          <span className="text-sm text-white/60 bg-white/10 rounded-full px-3 py-0.5">
            {index + 1} / {shuffled.length}
          </span>
        </div>

        <div
          className="transition-opacity ease-in-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <p className="text-xl sm:text-2xl font-bold group-hover:text-blue-200 transition-colors leading-snug drop-shadow-sm">
              {replaceEmojiShortcodes(pr.title)}
            </p>
            <p className="text-white/70 text-sm mt-1">
              {pr.repo}#{pr.number}
            </p>
          </a>

          <div className="flex items-center gap-3 mt-4">
            <img
              src={`https://github.com/${pr.author}.png`}
              alt={pr.author}
              className="w-14 h-14 rounded-full border-3 border-white shadow-lg shadow-white/30 ring-2 ring-blue-400/30"
              loading="lazy"
            />
            <a
              href={`https://github.com/${pr.author}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-blue-200 transition-colors font-medium"
            >
              @{pr.author}
            </a>
            {/* doesnt work (bad value) <span className="ml-auto text-white/70 text-sm bg-white/10 rounded-full px-3 py-1 font-semibold">
              🔥 {pr.comments} comment{pr.comments !== 1 ? "s" : ""}
            </span> */}
          </div>
        </div>
      </div>
    </section>
  );
}
