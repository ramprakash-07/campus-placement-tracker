/**
 * SkeletonRow — reusable table-row loading skeleton.
 *
 * Props:
 *  - cols: number of columns (default 6)
 *  - widths: optional array of tailwind width classes per cell
 *
 * Usage:
 *   <SkeletonRow cols={7} />
 *   <SkeletonRow widths={["w-28","w-24","w-16","w-14","w-20","w-8","w-8"]} />
 */
export default function SkeletonRow({ cols = 6, widths }) {
  const cells = widths || Array.from({ length: cols }, () => "w-20");
  return (
    <tr className="animate-pulse">
      {cells.map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 ${w} rounded-lg bg-gray-200`} />
        </td>
      ))}
    </tr>
  );
}
