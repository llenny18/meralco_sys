import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import SupervisorAuditLogs from '@/supervisor/supervisor-audit-logs';

function SupervisorAuditLogsPage() {
  return (
    <>
      <Head>
        <title>Audit Logs - WO Supervisor</title>
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
            <SupervisorAuditLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

SupervisorAuditLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="supervisor">{page}</SidebarLayout>
);

export default SupervisorAuditLogsPage;
