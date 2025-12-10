import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderSectors from '@/leader/leader-sectors';

function LeaderSectorsPage() {
  return (
    <>
      <Head>
        <title>Sectors - Team Leader</title>
      </Head>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <LeaderSectors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderSectorsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderSectorsPage;
