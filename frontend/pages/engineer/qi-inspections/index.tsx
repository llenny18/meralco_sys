import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorQiInspections from '@/engineer/supervisor-qi-inspections';

function SupervisorQiInspectionsPage() {
  return (
    <>
      <Head>
        <title>QI Inspections - WO Supervisor</title>
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
            <SupervisorQiInspections />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorQiInspectionsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorQiInspectionsPage;
