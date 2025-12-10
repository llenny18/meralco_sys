import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerSectors from '@/sector-manager/sector-manager-sectors';

function SectorManagerSectorsPage() {
  return (
    <>
      <Head>
        <title>Sector Overview - Sector Manager</title>
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
            <SectorManagerSectors />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerSectorsPage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerSectorsPage;
