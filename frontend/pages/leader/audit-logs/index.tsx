import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { Grid, Container } from '@mui/material';

import LeaderAuditLogs from '@/leader/leader-audit-logs';

function LeaderAuditLogsPage() {
  return (
    <>
      <Head>
        <title>Audit Logs - Team Leader</title>
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
            <LeaderAuditLogs />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

LeaderAuditLogsPage.getLayout = (page) => (
  <SidebarLayout userRole="leader">{page}</SidebarLayout>
);

export default LeaderAuditLogsPage;
