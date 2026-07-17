import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const interactiveSelector = [
  'button',
  'a',
  'input',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[data-cursor="interactive"]',
  '.leaflet-interactive',
  '.cursor-interactive'
].join(',');

const CURSOR_IMAGES = {
  idle: '/hummingbird-cursor.svg',
  hover: '/hummingbird-cursor.svg',
  click: '/hummingbird-cursor.svg'
} as const;

type CursorMode = keyof typeof CURSOR_IMAGES;

// Antes medía 74 px. Ahora ocupa exactamente la mitad para no tapar botones ni textos.
const CURSOR_WIDTH = 42;
const CURSOR_HEIGHT = 32;

// Las imágenes se invierten dentro de su propio contenedor. Estas coordenadas
// colocan el punto real del mouse en la punta del pico, no en el centro del ave.
const BEAK_HOTSPOT: Record<CursorMode, { x: number; y: number }> = {
  idle: { x: 0.025, y: 0.375 },
  hover: { x: 0.025, y: 0.375 },
  click: { x: 0.025, y: 0.375 }
};

const CustomCursor = () => {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const modeRef = useRef<CursorMode>('idle');
  const clickingRef = useRef(false);
  const [mode, setMode] = useState<CursorMode>('idle');
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    let cancelled = false;
    const idleImage = new Image();

    idleImage.onload = () => {
      if (cancelled) return;
      document.documentElement.classList.add('custom-cursor-ready');
      setReady(true);
    };

    idleImage.onerror = () => {
      if (cancelled) return;
      document.documentElement.classList.remove('custom-cursor-ready');
      setReady(false);
    };

    idleImage.src = CURSOR_IMAGES.idle;
    (['hover', 'click'] as CursorMode[]).forEach((imageMode) => {
      const image = new Image();
      image.src = CURSOR_IMAGES[imageMode];
    });

    return () => {
      cancelled = true;
      document.documentElement.classList.remove('custom-cursor-ready');
    };
  }, []);

  useEffect(() => {
    if (!ready || !window.matchMedia('(pointer: fine)').matches) return;

    const styleId = 'force-hide-native-cursor';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    const createdHere = !style;

    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      @media (pointer: fine) {
        html.custom-cursor-ready,
        html.custom-cursor-ready body,
        html.custom-cursor-ready body *,
        html.custom-cursor-ready #root,
        html.custom-cursor-ready #root * {
          cursor: none !important;
        }
      }
    `;

    const root = document.getElementById('root');
    document.documentElement.style.setProperty('cursor', 'none', 'important');
    document.body.style.setProperty('cursor', 'none', 'important');
    root?.style.setProperty('cursor', 'none', 'important');

    return () => {
      document.documentElement.style.removeProperty('cursor');
      document.body.style.removeProperty('cursor');
      root?.style.removeProperty('cursor');
      if (createdHere) style?.remove();
    };
  }, [ready]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!finePointer.matches) return;

    const changeMode = (nextMode: CursorMode) => {
      if (modeRef.current === nextMode) return;
      modeRef.current = nextMode;
      setMode(nextMode);
    };

    const positionCursor = (clientX: number, clientY: number, cursorMode: CursorMode) => {
      const hotspot = BEAK_HOTSPOT[cursorMode];
      cursorX.set(clientX - CURSOR_WIDTH * hotspot.x);
      cursorY.set(clientY - CURSOR_HEIGHT * hotspot.y);
    };

    const getHoverState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      return Boolean(element?.closest(interactiveSelector));
    };

    const move = (event: PointerEvent) => {
      const hovering = getHoverState(event.target);
      const nextMode: CursorMode = clickingRef.current ? 'click' : hovering ? 'hover' : 'idle';
      changeMode(nextMode);
      positionCursor(event.clientX, event.clientY, nextMode);
      setVisible(true);
    };

    const down = (event: PointerEvent) => {
      clickingRef.current = true;
      changeMode('click');
      positionCursor(event.clientX, event.clientY, 'click');
    };

    const up = (event: PointerEvent) => {
      clickingRef.current = false;
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const nextMode: CursorMode = getHoverState(target) ? 'hover' : 'idle';
      changeMode(nextMode);
      positionCursor(event.clientX, event.clientY, nextMode);
    };

    const leave = () => {
      setVisible(false);
      clickingRef.current = false;
      changeMode('idle');
    };

    const enter = () => setVisible(true);
    const visibility = () => {
      if (document.hidden) leave();
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [cursorX, cursorY]);

  if (!ready) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="custom-hummingbird-cursor"
      style={{ x: cursorX, y: cursorY, width: CURSOR_WIDTH, height: CURSOR_HEIGHT }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.08, ease: 'easeOut' }}
    >
      <motion.img
        src={CURSOR_IMAGES[mode]}
        alt=""
        draggable={false}
        className="custom-hummingbird-cursor-image"
        initial={false}
        animate={{
          scaleX: mode === 'click' ? 0.96 : mode === 'hover' ? 1.04 : 1,
          scaleY: mode === 'click' ? 0.96 : mode === 'hover' ? 1.04 : 1,
          rotate: mode === 'click' ? 3 : mode === 'hover' ? -1 : 0
        }}
        transition={{ duration: 0.08, ease: 'easeOut' }}
      />
    </motion.div>
  );
};

export default CustomCursor;
