import { MRT_RowData, MRT_TableOptions } from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es/index.esm.mjs';
import { Tables } from '../types/supabase';

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

function createDate(baseDate: Date, dayOfWeek: number, time: string) {
  // Calculate the difference between the base day of the week and the target day of the week
  let diff = dayOfWeek - baseDate.getDay();
  if (diff < 0) {
    diff += 7;
  }

  // Create the date
  let date = new Date(baseDate.getTime() + diff * 24 * 60 * 60 * 1000);

  // Set the time
  let [hour, minute, second] = time.split(':');
  date.setHours(parseInt(hour), parseInt(minute), parseInt(second));

  return date;
}

export function generateEventsFromBreaks(
  timeBlocks: Tables<'breaks'>[],
  startDateStr: string,
  endDateStr: string,
) {
  let startDate = new Date(startDateStr);
  let endDate = new Date(endDateStr);

  let events = [];

  for (let block of timeBlocks) {
    let currentDate = new Date(startDate.getTime());

    while (currentDate <= endDate) {
      if (currentDate.getDay() === block.day_of_week) {
        let start = createDate(currentDate, block.day_of_week, block.start_time);
        let end = createDate(currentDate, block.day_of_week, block.end_time);

        // Adjust the dates to the current week
        start.setDate(currentDate.getDate());
        end.setDate(currentDate.getDate());

        events.push({
          title: 'Receso',
          start: start,
          end: end,
          display: 'auto',
          color: 'lightgray',
          resourceId: String(block.specialist_id),
          type: 'Break',
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return events;
}
