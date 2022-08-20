import { RingProgress, Text, SimpleGrid, Paper, Center, Group } from '@mantine/core';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons';
import { GetServerSideProps } from 'next';

interface StatsRingProps {
  data: {
    label: string;
    stats: string;
    progress: number;
    color: string;
    icon: 'up' | 'down';
  }[];
}

const icons = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
};

export default function Dashboard({ data }: StatsRingProps) {
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];
    return (
      <Paper withBorder radius="md" p="xs" key={stat.label}>
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: stat.progress, color: stat.color }]}
            label={
              <Center>
                <Icon size={22} stroke={1.5} />
              </Center>
            }
          />

          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              {stat.label}
            </Text>
            <Text weight={700} size="xl">
              {stat.stats}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return (
    <SimpleGrid cols={3} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
      {stats}
    </SimpleGrid>
  );
}

export const getServerSideProps = withPageAuth({ redirectTo: '/login', async getServerSideProps(ctx) { 
  return {
    props: {
      data: [
        {
          label: 'test',
          stats: '11',
          progress: 50,
          color: 'red',
          icon: 'up',
        },
      ],
    },
  }
}});