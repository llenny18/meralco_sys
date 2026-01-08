import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import EngineerDashboard from '@/engineer/dash';

function EngineerDashboardPage() {
  return (
    <>
      <Head>
        <title>Notifications - WO Supervisor</title>
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
            <EngineerDashboard />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

EngineerDashboardPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default EngineerDashboardPage;
