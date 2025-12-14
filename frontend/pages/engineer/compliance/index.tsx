import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorCompliance from '@/engineer/supervisor-compliance';

function SupervisorCompliancePage() {
  return (
    <>
      <Head>
        <title>Document Compliance - WO Supervisor</title>
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
            <SupervisorCompliance />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorCompliancePage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorCompliancePage;
