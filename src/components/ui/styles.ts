export const commonClass =
  "transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface disabled:cursor-not-allowed";

export const commonInputClass = `w-full rounded-md border  
bg-surface text-on-surface placeholder:text-neutral-disabled 
disabled:border-neutral-disabled disabled:bg-neutral-500/10
autofill:bg-surface autofill:text-on-surface
[&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] 
[&:-webkit-autofill]:[-webkit-text-fill-color:theme('colors.black')]
dark:[&:-webkit-autofill]:shadow-[0_0_0_30px_black_inset] 
dark:[&:-webkit-autofill]:[-webkit-text-fill-color:theme('colors.white')]`;

export const sizeClasses = {
  lg: "h-12 text-lg",
  md: "h-10 text-base",
  sm: "h-8 text-sm",
};
