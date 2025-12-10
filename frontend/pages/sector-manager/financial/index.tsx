import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SectorManagerFinancial from '@/sector-manager/sector-manager-financial';

function SectorManagerFinancialPage() {
  return (
    <>
      <Head>
        <title>Financial Overview - Sector Manager</title>
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
            <SectorManagerFinancial />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SectorManagerFinancialPage.getLayout = (page) => (
  <SidebarLayout userRole="sector-manager">{page}</SidebarLayout>
);

export default SectorManagerFinancialPage;
