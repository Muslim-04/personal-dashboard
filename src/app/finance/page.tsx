'use client'

import { useCallback, useState } from 'react'
import { FinanceForm } from '@/components/finance/FinanceForm'
import { FinanceSummary } from '@/components/finance/FinanceSummary'
import { FinanceChart } from '@/components/finance/FinanceChart'
import { FinanceCategoryChart } from '@/components/finance/FinanceCategoryChart'
import { FinanceList } from '@/components/finance/FinanceList'
import { LoanTracker } from '@/components/finance/LoanTracker'
import { FinanceSettings } from '@/components/finance/FinanceSettings'
import { useCategories, useFinanceEntries, useProjects } from '@/lib/hooks/useFinance'
import { FinanceScope, FinanceType } from '@/lib/types'
import { Period } from '@/lib/period'

export default function FinancePage() {
  const { entries, addEntry, removeEntry, renameProjectInEntries, renameCategoryInEntries, hydrated } = useFinanceEntries()
  const { projects, addProject, removeProject, renameProject } = useProjects()
  const { lists, getList, addCategory, removeCategory, renameCategory, hydrated: categoriesHydrated } = useCategories()
  const [period, setPeriod] = useState<Period>('month')

  // Renaming a project/category also updates every past entry that used the old name,
  // so history never ends up pointing at a label that no longer exists in the list.
  const handleRenameProject = useCallback((oldName: string, newName: string) => {
    renameProject(oldName, newName)
    renameProjectInEntries(oldName, newName)
  }, [renameProject, renameProjectInEntries])

  const handleRenameCategory = useCallback((scope: FinanceScope, type: FinanceType, oldName: string, newName: string) => {
    renameCategory(scope, type, oldName, newName)
    renameCategoryInEntries(scope, type, oldName, newName)
  }, [renameCategory, renameCategoryInEntries])

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div>
        <h1 className="text-xl font-bold text-neutral-100 md:text-2xl">Финансы</h1>
        <p className="text-sm text-neutral-500">Бизнес-проекты и личные финансы</p>
      </div>

      <FinanceForm projects={projects} addProject={addProject} getCategories={getList} addEntry={addEntry} />

      {categoriesHydrated && (
        <FinanceSettings
          projects={projects}
          addProject={addProject}
          removeProject={removeProject}
          renameProject={handleRenameProject}
          categories={lists}
          addCategory={addCategory}
          removeCategory={removeCategory}
          renameCategory={handleRenameCategory}
        />
      )}

      {hydrated && (
        <>
          <FinanceSummary entries={entries} period={period} />
          <FinanceCategoryChart entries={entries} period={period} />
          <FinanceChart entries={entries} />
          <LoanTracker />
          <FinanceList
            entries={entries}
            projects={projects}
            period={period}
            onPeriodChange={setPeriod}
            onRemove={removeEntry}
          />
        </>
      )}
    </div>
  )
}
