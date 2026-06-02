export type Photo = {
  id: string;
  name: string;
  /** Data URL used for the thumbnail/strip preview. */
  src: string;
  img: HTMLImageElement;
  /** Original file, kept for background removal. */
  file: File;
  /** Cut-out foreground (transparent bg) once removal has run. */
  foreground: HTMLImageElement | null;
  /** True while background removal is in flight for this photo. */
  removing: boolean;
};
