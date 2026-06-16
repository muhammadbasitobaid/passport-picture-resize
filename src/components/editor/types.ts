export type Photo = {
  id: string;
  name: string;
  /** Data URL used for the thumbnail/strip preview. */
  src: string;
  img: HTMLImageElement;
  /** Original file (kept for reference / potential re-processing). */
  file: File;
  /** Full-res cut-out (transparent bg) once removal has run. */
  foreground: HTMLCanvasElement | null;
  /** True while background removal is in flight for this photo. */
  removing: boolean;
};
