import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import QiDailyTargets from '@/qi/qi-daily-targets';

function QiDailyTargetsPage() {
  return (
    <>
      <Head>
        <title>Daily Targets - Quality Inspector</title>
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
            <QiDailyTargets />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

QiDailyTargetsPage.getLayout = (page) => (
  <SidebarLayout userRole="qi">{page}</SidebarLayout>
);

export default QiDailyTargetsPage;
