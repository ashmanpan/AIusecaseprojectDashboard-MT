/**
 * Sync Test Case Counts Script
 *
 * This script reads all test cases from DynamoDB and updates each use case's
 * unitTestProgress field with the correct total and completed counts.
 *
 * Usage:
 *   node scripts/sync-testcase-counts.js
 *
 * Or run from browser console on any page of the portal.
 */

async function syncAllUseCaseTestCounts() {
    console.log('=== Syncing Test Case Counts ===\n');

    try {
        // Get all use cases
        const useCases = await UseCaseDB.getAllUseCases();
        console.log(`Found ${useCases.length} use cases\n`);

        let updated = 0;
        let errors = 0;

        for (const useCase of useCases) {
            try {
                // Get test cases for this use case
                const testCases = await TestCaseDB.getTestCases(useCase.id);

                const total = testCases.length;
                const completed = testCases.filter(tc => tc.status === 'PASSED').length;

                const oldProgress = useCase.unitTestProgress || { completed: 0, total: 0 };

                // Check if update needed
                if (oldProgress.total !== total || oldProgress.completed !== completed) {
                    // Update use case
                    useCase.unitTestProgress = { completed, total };
                    const result = await UseCaseDB.updateUseCase(useCase);

                    if (result.success) {
                        console.log(`✓ ${useCase.id} (${useCase.name})`);
                        console.log(`  Updated: ${oldProgress.completed}/${oldProgress.total} → ${completed}/${total}`);
                        updated++;
                    } else {
                        console.log(`✗ ${useCase.id}: ${result.error}`);
                        errors++;
                    }
                } else {
                    console.log(`- ${useCase.id}: Already in sync (${completed}/${total})`);
                }
            } catch (err) {
                console.log(`✗ ${useCase.id}: ${err.message}`);
                errors++;
            }
        }

        console.log('\n=== Sync Complete ===');
        console.log(`Updated: ${updated}`);
        console.log(`Errors: ${errors}`);
        console.log(`Skipped (already synced): ${useCases.length - updated - errors}`);

        return { updated, errors, total: useCases.length };

    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }
}

// For browser console usage
if (typeof window !== 'undefined') {
    window.syncAllUseCaseTestCounts = syncAllUseCaseTestCounts;
    console.log('Run syncAllUseCaseTestCounts() to sync all use case test counts');
}

// For Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { syncAllUseCaseTestCounts };
}
