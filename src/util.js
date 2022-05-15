export const size = 5;
export const empty = " ";
export const block = "/";

export const coordinate = (i) => ({ row: Math.floor(i / size), col: i % size });
