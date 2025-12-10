import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiPerformance from '@/qi/qi-performance';

function QiPerformancePage() {
  return (
    <>
      <Head>
        <title>Performance - Quality Inspector</title>
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
            <QiPerformance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiPerformancePage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiPerformancePage;
