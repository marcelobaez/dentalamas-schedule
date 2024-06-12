import { MRT_RowData, MRT_TableOptions } from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export const getMantineStyleAndOpts = <TData extends MRT_RowData>(
  isError: boolean,
): Omit<MRT_TableOptions<TData>, 'data' | 'rowCount' | 'columns'> => ({
  // style props
  mantineToolbarAlertBannerProps: isError
    ? {
        color: 'red',
        children: 'Error al obtener los datos',
      }
    : undefined,
  mantinePaperProps: {
    withBorder: false,
    shadow: undefined,
    radius: 0,
    style: {
      backgroundColor: 'transparent',
    },
  },
  mantineTopToolbarProps: {
    style: {
      backgroundColor: 'transparent',
    },
  },
  mantineBottomToolbarProps: {
    style: {
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
  },
  mantineTableProps: {
    withTableBorder: true,
  },
  mantineTableContainerProps: {
    mah: 'calc(100dvh - 248px)',
  },
  mantineTableHeadProps: {
    styles: {
      thead: {
        opacity: 1,
      },
    },
  },
  // option defaults (server side pagination, sorting and filter)
  enableRowActions: true,
  enableColumnFilterModes: true,
  enableStickyFooter: true,
  enableStickyHeader: true,
  enableGlobalFilter: true,
  enableFullScreenToggle: false,
  enableDensityToggle: false,
  enableColumnFilters: false,
  manualFiltering: true,
  manualPagination: true,
  manualSorting: true,
  // lcoalization
  localization: MRT_Localization_ES,
});
