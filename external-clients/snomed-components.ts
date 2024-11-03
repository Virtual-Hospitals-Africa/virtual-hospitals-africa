// deno-lint-ignore-file no-explicit-any
export type components = {
  schemas: {
    ReferenceSetMemberView_Component: {
      additionalFields?: { [key: string]: string }
      effectiveTime?: string
      refsetId?: string
      releasedEffectiveTime?: number
      moduleId?: string
      referencedComponentId?: string
      released?: boolean
      memberId?: string
      active?: boolean
    }
    ClassificationUpdateRequest: {
      status?:
        | 'SCHEDULED'
        | 'RUNNING'
        | 'FAILED'
        | 'COMPLETED'
        | 'STALE'
        | 'SAVING_IN_PROGRESS'
        | 'SAVED'
        | 'SAVE_FAILED'
    }
    CodeSystemUpdateRequest: {
      name?: string
      owner?: string
      countryCode?: string
      maintainerType?: string
      defaultLanguageCode?: string
      defaultLanguageReferenceSets?: string[]
      dailyBuildAvailable?: boolean
    }
    CodeSystem: {
      name?: string
      owner?: string
      shortName: string
      branchPath: string
      dependantVersionEffectiveTime?: number
      dailyBuildAvailable?: boolean
      latestDailyBuild?: string
      countryCode?: string
      defaultLanguageCode?: string
      defaultLanguageReferenceSets?: string[]
      maintainerType?: string
      latestVersion?: components['schemas']['CodeSystemVersion']
      languages?: { [key: string]: string }
      modules?: components['schemas']['ConceptMini'][]
      userRoles?: string[]
    }
    CodeSystemVersion: {
      id?: string
      shortName?: string
      importDate?: string
      parentBranchPath?: string
      effectiveDate?: number
      version?: string
      description?: string
      releasePackage?: string
      dependantVersionEffectiveTime?: number
      codeSystem?: components['schemas']['CodeSystem']
      branchPath?: string
    }
    ConceptMini: {
      conceptId?: string
      active?: boolean
      definitionStatus?: string
      moduleId?: string
      effectiveTime?: string
      fsn?: components['schemas']['TermLangPojo']
      pt?: components['schemas']['TermLangPojo']
      descendantCount?: number
      isLeafInferred?: boolean
      isLeafStated?: boolean
      id?: string
      definitionStatusId?: string
      leafInferred?: components['schemas']['ConceptMini']
      leafStated?: components['schemas']['ConceptMini']
      extraFields?: { [key: string]: { [key: string]: any } }
      idAndFsnTerm?: string
    }
    TermLangPojo: { term?: string; lang?: string }
    Annotation_Component: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      refsetId: string
      referencedComponentId: string
      conceptId?: string
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject_Component']
      mapTargetCoding?: components['schemas']['Coding_Component']
      annotationId?: string
      typeId?: string
      value?: string
      languageDialectCode?: string
      typePt?: components['schemas']['TermLangPojo_Component']
      effectiveTime?: string
      mapGroup?: string
      mapPriority?: string
      referencedComponent?: { [key: string]: any }
    }
    Axiom_Component: {
      axiomId?: string
      moduleId?: string
      active?: boolean
      released?: boolean
      definitionStatusId?: string
      relationships?: components['schemas']['Relationship_Component'][]
      definitionStatus?: string
      id?: string
      effectiveTime?: number
    }
    Coding_Component: { system?: string; code?: string; display?: string }
    Component_Component: {
      published?: boolean
      moduleId?: string
      released?: boolean
      id?: string
      active?: boolean
    }
    ConceptMini_Component: {
      conceptId?: string
      active?: boolean
      definitionStatus?: string
      moduleId?: string
      effectiveTime?: string
      fsn?: components['schemas']['TermLangPojo_Component']
      pt?: components['schemas']['TermLangPojo_Component']
      descendantCount?: number
      isLeafInferred?: boolean
      isLeafStated?: boolean
      id?: string
      definitionStatusId?: string
      leafInferred?: components['schemas']['ConceptMini_Component']
      leafStated?: components['schemas']['ConceptMini_Component']
      extraFields?: { [key: string]: { [key: string]: any } }
      idAndFsnTerm?: string
    }
    ConceptView_Component: {
      conceptId?: string
      identifiers?: components['schemas']['Identifier_Component'][]
      fsn?: components['schemas']['TermLangPojo_Component']
      classAxioms?: components['schemas']['Axiom_Component'][]
      gciAxioms?: components['schemas']['Axiom_Component'][]
      effectiveTime?: string
      descriptions?: components['schemas']['Description_Component'][]
      moduleId?: string
      relationships?: components['schemas']['Relationship_Component'][]
      pt?: components['schemas']['TermLangPojo_Component']
      definitionStatusId?: string
      annotations?: components['schemas']['Annotation_Component'][]
      active?: boolean
      validationResults?: components['schemas']['InvalidContent_Component'][]
    }
    ConcreteValue_Component: {
      dataType?: 'DECIMAL' | 'INTEGER' | 'STRING'
      value?: string
      valueWithPrefix?: string
    }
    Description_Component: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      descriptionId?: string
      term: string
      termFolded?: string
      termLen?: number
      tag?: string
      conceptId?: string
      languageCode: string
      typeId: string
      caseSignificanceId: string
      acceptabilityMap?: { [key: string]: string }
      lang?: string
      inactivationIndicator?: string
      associationTargets?: { [key: string]: string[] }
      languageRefsetMembers?: components['schemas']['Description_Component']
      type?: string
      caseSignificance?: string
      acceptabilityMapFromLangRefsetMembers?: { [key: string]: string }
      effectiveTime?: string
    }
    Identifier_Component: {
      alternateIdentifier: string
      effectiveTime?: string
      active?: boolean
      moduleId?: string
      identifierSchemeId: string
      identifierScheme?: components['schemas']['ConceptMini_Component']
      referencedComponentId: string
      released?: boolean
      releasedEffectiveTime?: number
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      effectiveTimeI?: number
      releaseHash?: string
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject_Component']
      id?: string
      referencedComponent?: { [key: string]: any }
    }
    InvalidContent_Component: {
      ruleId?: string
      conceptId?: string
      conceptFsn?: string
      component?: components['schemas']['Component_Component']
      message?: string
      severity?: 'ERROR' | 'WARNING'
      ignorePublishedCheck?: boolean
      published?: boolean
      componentId?: string
    }
    Relationship_Component: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      relationshipId?: string
      sourceId?: string
      destinationId?: string
      concreteValue?: components['schemas']['ConcreteValue_Component']
      relationshipGroup?: number
      typeId: string
      characteristicTypeId: string
      modifierId: string
      source?: components['schemas']['ConceptMini_Component']
      type?: components['schemas']['ConceptMini_Component']
      target?: components['schemas']['ConceptMini_Component']
      characteristicType?: string
      relationshipIdAsLong?: number
      inferred?: boolean
      groupId?: number
      grouped?: boolean
      modifier?: string
      concrete?: boolean
      effectiveTime?: string
      id?: string
    }
    SnomedComponentObject_Component: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      effectiveTime?: string
      id?: string
    }
    TermLangPojo_Component: { term?: string; lang?: string }
    UpdateBranchRequest: {
      metadata?: { [key: string]: { [key: string]: any } }
    }
    BranchPojo: {
      path?: string
      state?: 'UP_TO_DATE' | 'FORWARD' | 'BEHIND' | 'DIVERGED'
      containsContent?: boolean
      locked?: boolean
      creation?: string
      base?: string
      head?: string
      creationTimestamp?: number
      baseTimestamp?: number
      headTimestamp?: number
      userRoles?: string[]
      globalUserRoles?: string[]
      versionsReplacedCounts?: { [key: string]: number }
      metadata?: { [key: string]: { [key: string]: any } }
      versionsReplaced?: { [key: string]: string[] }
    }
    UserGroupsPojo: { userGroups?: string[] }
    IntegrityIssueReport: {
      axiomsWithMissingOrInactiveReferencedConcept?: {
        [key: string]: components['schemas']['ConceptMini']
      }
      relationshipsWithMissingOrInactiveSource?: { [key: string]: number }
      relationshipsWithMissingOrInactiveType?: { [key: string]: number }
      relationshipsWithMissingOrInactiveDestination?: { [key: string]: number }
      empty?: boolean
    }
    MemberSearchRequest_Component: {
      active?: boolean
      referenceSet?: string
      module?: string
      referencedComponentIds?: { [key: string]: any }[]
      owlExpressionConceptId?: string
      owlExpressionGCI?: boolean
      additionalFields?: { [key: string]: string }
      additionalFieldSets?: { [key: string]: string[] }
      includeNonSnomedMapTerms?: boolean
      nullEffectiveTime?: boolean
    }
    ItemsPageReferenceSetMember_Component: {
      items?: components['schemas']['ReferenceSetMember_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ReferenceSetMember_Component: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      memberId?: string
      refsetId: string
      referencedComponentId: string
      conceptId?: string
      additionalFields?: { [key: string]: string }
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject_Component']
      mapTargetCoding?: components['schemas']['Coding_Component']
      mapGroup?: string
      mapPriority?: string
      referencedComponent?: { [key: string]: any }
      effectiveTime?: string
    }
    CreatePostCoordinatedExpressionRequest: {
      moduleId?: string
      closeToUserForm?: string
    }
    PostCoordinatedExpression: {
      id?: string
      closeToUserForm?: string
      classifiableForm?: string
      humanReadableClassifiableForm?: string
    }
    ConceptSearchRequest: {
      termFilter?: string
      termActive?: boolean
      activeFilter?: boolean
      descriptionType?: number[]
      language?: string[]
      preferredIn?: number[]
      acceptableIn?: number[]
      preferredOrAcceptableIn?: number[]
      definitionStatusFilter?: string
      module?: number[]
      includeLeafFlag?: boolean
      form?: 'inferred' | 'stated' | 'additional'
      eclFilter?: string
      effectiveTime?: number
      nullEffectiveTime?: boolean
      published?: boolean
      statedEclFilter?: string
      conceptIds?: string[]
      returnIdOnly?: boolean
      offset?: number
      limit?: number
      searchAfter?: string
    }
    ItemsPageObject: {
      items?: { [key: string]: any }[]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ExpressionConstraint: { [key: string]: any }
    EclString: { eclString?: string }
    CreateReviewRequest: { source: string; target: string }
    MultibranchDescriptionSearchRequest_Component: { branches?: string[] }
    BrowserDescriptionSearchResult_Component: {
      term?: string
      active?: boolean
      languageCode?: string
      module?: string
      concept?: components['schemas']['ConceptMini_Component']
    }
    ItemsPageBrowserDescriptionSearchResult_Component: {
      items?:
        components['schemas']['BrowserDescriptionSearchResult_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    MergeRequest: {
      source?: string
      target?: string
      commitComment?: string
      reviewId?: string
    }
    Annotation: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      memberId?: string
      refsetId: string
      referencedComponentId: string
      conceptId?: string
      additionalFields?: { [key: string]: string }
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject']
      mapTargetCoding?: components['schemas']['Coding']
      annotationId?: string
      typeId?: string
      value?: string
      languageDialectCode?: string
      typePt?: components['schemas']['TermLangPojo']
      effectiveTime?: string
      mapGroup?: string
      mapPriority?: string
      referencedComponent?: { [key: string]: any }
    }
    Axiom: {
      axiomId?: string
      moduleId?: string
      active?: boolean
      released?: boolean
      definitionStatusId?: string
      relationships?: components['schemas']['Relationship'][]
      definitionStatus?: string
      id?: string
      effectiveTime?: number
    }
    Coding: { system?: string; code?: string; display?: string }
    Component: {
      published?: boolean
      moduleId?: string
      released?: boolean
      id?: string
      active?: boolean
    }
    /**
     * The concept to validate
     */
    Concept: {
      conceptId?: string
      descendantCount?: number
      fsn?: components['schemas']['TermLangPojo']
      pt?: components['schemas']['TermLangPojo']
      active?: boolean
      effectiveTime?: string
      released?: boolean
      releasedEffectiveTime?: number
      inactivationIndicator?: string
      associationTargets?: { [key: string]: string[] }
      moduleId?: string
      definitionStatus?: string
      definitionStatusId: string
      descriptions?: components['schemas']['Description'][]
      annotations?: components['schemas']['Annotation'][]
      classAxioms?: components['schemas']['Axiom'][]
      gciAxioms?: components['schemas']['Axiom'][]
      relationships?: components['schemas']['Relationship'][]
      alternateIdentifiers?: components['schemas']['Identifier'][]
      validationResults?: components['schemas']['InvalidContent'][]
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      effectiveTimeI?: number
      releaseHash?: string
      activeDescriptions?: components['schemas']['Description'][]
      allOwlAxiomMembers?: components['schemas']['ReferenceSetMember'][]
      activeInferredRelationships?: components['schemas']['Relationship'][]
      allAnnotationMembers?: components['schemas']['ReferenceSetMember'][]
      primitive?: boolean
    }
    ConcreteValue: {
      dataType?: 'DECIMAL' | 'INTEGER' | 'STRING'
      value?: string
      valueWithPrefix?: string
    }
    Description: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      descriptionId?: string
      term: string
      termFolded?: string
      termLen?: number
      tag?: string
      conceptId?: string
      languageCode: string
      typeId: string
      caseSignificanceId: string
      acceptabilityMap?: { [key: string]: string }
      lang?: string
      inactivationIndicator?: string
      associationTargets?: { [key: string]: string[] }
      languageRefsetMembers?: components['schemas']['Description']
      type?: string
      caseSignificance?: string
      acceptabilityMapFromLangRefsetMembers?: { [key: string]: string }
      effectiveTime?: string
    }
    Identifier: {
      alternateIdentifier: string
      effectiveTime?: string
      active?: boolean
      moduleId?: string
      identifierSchemeId: string
      identifierScheme?: components['schemas']['ConceptMini']
      referencedComponentId: string
      released?: boolean
      releasedEffectiveTime?: number
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      effectiveTimeI?: number
      releaseHash?: string
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject']
      id?: string
      referencedComponent?: { [key: string]: any }
    }
    InvalidContent: {
      ruleId?: string
      conceptId?: string
      conceptFsn?: string
      component?: components['schemas']['Component']
      message?: string
      severity?: 'ERROR' | 'WARNING'
      ignorePublishedCheck?: boolean
      published?: boolean
      componentId?: string
    }
    ReferenceSetMember: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      memberId?: string
      refsetId: string
      referencedComponentId: string
      conceptId?: string
      additionalFields?: { [key: string]: string }
      referencedComponentSnomedComponent?:
        components['schemas']['SnomedComponentObject']
      mapTargetCoding?: components['schemas']['Coding']
      mapGroup?: string
      mapPriority?: string
      referencedComponent?: { [key: string]: any }
      effectiveTime?: string
    }
    Relationship: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      relationshipId?: string
      sourceId?: string
      destinationId?: string
      concreteValue?: components['schemas']['ConcreteValue']
      relationshipGroup?: number
      typeId: string
      characteristicTypeId: string
      modifierId: string
      source?: components['schemas']['ConceptMini']
      type?: components['schemas']['ConceptMini']
      target?: components['schemas']['ConceptMini']
      characteristicType?: string
      relationshipIdAsLong?: number
      inferred?: boolean
      groupId?: number
      grouped?: boolean
      modifier?: string
      concrete?: boolean
      effectiveTime?: string
      id?: string
    }
    SnomedComponentObject: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      active?: boolean
      moduleId?: string
      effectiveTimeI?: number
      released?: boolean
      releaseHash?: string
      releasedEffectiveTime?: number
      effectiveTime?: string
      id?: string
    }
    ImportCreationRequest: {
      type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
      branchPath: string
      createCodeSystemVersion?: boolean
      internalRelease?: boolean
      filterModuleIds?: string[]
    }
    LocalFileImportCreationRequest: {
      type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
      branchPath: string
      createCodeSystemVersion?: boolean
      internalRelease?: boolean
      filterModuleIds?: string[]
      filePath?: string
    }
    ImportPatchCreationRequest: {
      type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
      branchPath?: string
      patchReleaseVersion?: number
    }
    ExportRequestView: {
      id?: string
      startDate?: string
      branchPath: string
      type: 'DELTA' | 'SNAPSHOT' | 'FULL'
      filenameEffectiveDate?: string
      conceptsAndRelationshipsOnly?: boolean
      unpromotedChangesOnly?: boolean
      legacyZipNaming?: boolean
      /**
       * Format: yyyymmdd. Add a transient effectiveTime to rows of content which are not yet versioned.
       */
      transientEffectiveTime?: string
      /**
       * Format: yyyymmdd. Can be used to produce a delta after content is versioned by filtering a SNAPSHOT export by effectiveTime.
       */
      startEffectiveTime?: string
      moduleIds?: string[]
      /**
       * If refsetIds are included, this indicates that the export will be a refset-only export.
       */
      refsetIds?: string[]
      status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'DOWNLOADED' | 'FAILED'
      exportFilePath?: string
      startExport?: boolean
    }
    CodeSystemCreate: {
      branchPath?: string
      defaultLanguageCode?: string
      dependantVersionEffectiveTime?: number
      shortName?: string
      name?: string
      owner?: string
      defaultLanguageReferenceSets?: string[]
      countryCode?: string
      maintainerType?: string
    }
    CreateCodeSystemVersionRequest: {
      effectiveDate?: number
      description?: string
      internalRelease?: boolean
    }
    CodeSystemUpgradeRequest: {
      newDependantVersion?: number
      contentAutomations?: boolean
    }
    ConceptView: {
      conceptId?: string
      identifiers?: components['schemas']['Identifier'][]
      fsn?: components['schemas']['TermLangPojo']
      classAxioms?: components['schemas']['Axiom'][]
      gciAxioms?: components['schemas']['Axiom'][]
      effectiveTime?: string
      descriptions?: components['schemas']['Description'][]
      moduleId?: string
      relationships?: components['schemas']['Relationship'][]
      pt?: components['schemas']['TermLangPojo']
      definitionStatusId?: string
      annotations?: components['schemas']['Annotation'][]
      active?: boolean
      validationResults?: components['schemas']['InvalidContent'][]
    }
    BodyBuilder: { [key: string]: any }
    ConceptBulkLoadRequest_Component: {
      conceptIds?: string[]
      descriptionIds?: string[]
    }
    Concept_Component: {
      conceptId?: string
      descendantCount?: number
      fsn?: components['schemas']['TermLangPojo_Component']
      pt?: components['schemas']['TermLangPojo_Component']
      active?: boolean
      effectiveTime?: string
      released?: boolean
      releasedEffectiveTime?: number
      inactivationIndicator?: string
      associationTargets?: { [key: string]: string[] }
      moduleId?: string
      definitionStatus?: string
      definitionStatusId: string
      descriptions?: components['schemas']['Description_Component'][]
      annotations?: components['schemas']['Annotation_Component'][]
      classAxioms?: components['schemas']['Axiom_Component'][]
      gciAxioms?: components['schemas']['Axiom_Component'][]
      relationships?: components['schemas']['Relationship_Component'][]
      alternateIdentifiers?: components['schemas']['Identifier_Component'][]
      validationResults?: components['schemas']['InvalidContent_Component'][]
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      changed?: boolean
      effectiveTimeI?: number
      releaseHash?: string
      activeDescriptions?: components['schemas']['Description_Component'][]
      allOwlAxiomMembers?:
        components['schemas']['ReferenceSetMember_Component'][]
      activeInferredRelationships?:
        components['schemas']['Relationship_Component'][]
      allAnnotationMembers?:
        components['schemas']['ReferenceSetMember_Component'][]
      primitive?: boolean
    }
    CreateBranchRequest: {
      parent?: string
      name?: string
      metadata?: { [key: string]: { [key: string]: any } }
    }
    SetAuthorFlag: { name?: string; value?: boolean }
    ResponseMessage: { message?: string }
    UpdatedDocumentCount: { updateCount?: { [key: string]: number } }
    ConceptsInForm: {
      statedConceptIds?: number[]
      inferredConceptIds?: number[]
    }
    InactivationTypeAndConceptIdList_Component: {
      inactivationIndicator?: components['schemas']['ConceptMini_Component']
      conceptIds?: number[]
    }
    ItemsPageRelationship_Component: {
      items?: components['schemas']['Relationship_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    AsyncRefsetMemberChangeBatch: {
      id?: string
      startTime?: string
      status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
      memberIds?: string[]
      endTime?: string
      message?: string
      secondsDuration?: number
    }
    ItemsPageIdentifier_Component: {
      items?: components['schemas']['Identifier_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ItemsPageDescription_Component: {
      items?: components['schemas']['Description_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ConceptReferencesResult: {
      total?: number
      limit?: number
      offset?: number
      referencesByType?: components['schemas']['TypeReferences'][]
    }
    TypeReferences: {
      referenceType?: components['schemas']['ConceptMini']
      referencingConcepts?: components['schemas']['ConceptMini'][]
    }
    ExpressionStringPojo: { expression?: string }
    InboundRelationshipsResult_Component: {
      inboundRelationships?: components['schemas']['Relationship_Component'][]
      total?: number
    }
    ConceptDescriptionsResult_Component: {
      conceptDescriptions?: components['schemas']['Description_Component'][]
    }
    ItemsPageObject_Component: {
      items?: { [key: string]: any }[]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ConceptMicro: { id?: string; primitive?: boolean; term?: string }
    Expression: {
      attributes?: components['schemas']['ExpressionAttribute'][]
      concepts?: components['schemas']['ConceptMicro'][]
      groups?: components['schemas']['ExpressionGroup'][]
    }
    ExpressionAttribute: {
      type?: components['schemas']['ConceptMicro']
      target?: components['schemas']['ConceptMicro']
      value?: components['schemas']['ConcreteValue']
      concrete?: boolean
    }
    ExpressionGroup: {
      attributes?: components['schemas']['ExpressionAttribute'][]
    }
    Classification: {
      id?: string
      path?: string
      status?:
        | 'SCHEDULED'
        | 'RUNNING'
        | 'FAILED'
        | 'COMPLETED'
        | 'STALE'
        | 'SAVING_IN_PROGRESS'
        | 'SAVED'
        | 'SAVE_FAILED'
      errorMessage?: string
      reasonerId?: string
      userId?: string
      creationDate?: string
      completionDate?: string
      lastCommitDate?: string
      saveDate?: string
      inferredRelationshipChangesFound?: boolean
      redundantStatedRelationshipsFound?: boolean
      equivalentConceptsFound?: boolean
    }
    ItemsPageClassification: {
      items?: components['schemas']['Classification'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ItemsPageRelationshipChange: {
      items?: components['schemas']['RelationshipChange'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    RelationshipChange: {
      internalId?: string
      classificationId?: string
      relationshipId?: string
      active?: boolean
      sourceId?: string
      destinationId?: string
      value?: string
      group?: number
      typeId?: string
      modifierId?: string
      inferredNotStated?: boolean
      source?: components['schemas']['ConceptMini']
      destination?: components['schemas']['ConceptMini']
      type?: components['schemas']['ConceptMini']
      sourceFsn?: string
      typeFsn?: string
      destinationFsn?: string
      unionGroup?: number
      destinationOrValue?: string
      characteristicTypeId?: string
      destinationOrValueWithoutPrefix?: string
      changeNature?: 'INFERRED' | 'REDUNDANT'
      destinationOrRawValue?: { [key: string]: any }
      concrete?: boolean
    }
    EquivalentConceptsResponse: {
      equivalentConcepts?: components['schemas']['ItemsPageConceptMini']
    }
    ItemsPageConceptMini: {
      items?: components['schemas']['ConceptMini'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ItemsPageEquivalentConceptsResponse: {
      items?: components['schemas']['EquivalentConceptsResponse'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    AuthoringStatsSummary: {
      newConceptsCount?: number
      inactivatedConceptsCount?: number
      reactivatedConceptsCount?: number
      changedFsnCount?: number
      inactivatedSynonymsCount?: number
      newSynonymsForExistingConceptsCount?: number
      reactivatedSynonymsCount?: number
      executionTime?: string
      title?: string
    }
    DescriptionMicro: { id?: string; conceptId?: string; term?: string }
    BuildVersion: { version?: string; time?: string }
    BranchReview: {
      id: string
      lastUpdated?: string
      status?: 'PENDING' | 'CURRENT' | 'STALE' | 'FAILED'
      source?: components['schemas']['BranchState']
      target?: components['schemas']['BranchState']
      changedConcepts?: number[]
      sourceParent?: boolean
    }
    BranchState: {
      path?: string
      baseTimestamp?: number
      headTimestamp?: number
    }
    BranchReviewConceptChanges: { changedConcepts?: number[] }
    PageBrowserDescriptionSearchResult_Component: {
      totalPages?: number
      totalElements?: number
      pageable?: components['schemas']['PageableObject_Component']
      numberOfElements?: number
      size?: number
      content?:
        components['schemas']['BrowserDescriptionSearchResult_Component'][]
      number?: number
      sort?: components['schemas']['SortObject'][]
      first?: boolean
      last?: boolean
      empty?: boolean
    }
    PageableObject_Component: {
      pageNumber?: number
      pageSize?: number
      paged?: boolean
      unpaged?: boolean
      offset?: number
      sort?: components['schemas']['SortObject'][]
    }
    SortObject: {
      direction?: string
      nullHandling?: string
      ascending?: boolean
      property?: string
      ignoreCase?: boolean
    }
    ItemsPageConceptMini_Component: {
      items?: components['schemas']['ConceptMini_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ApiError: {
      message?: string
      developerMessage?: string
      additionalInfo?: { [key: string]: { [key: string]: any } }
    }
    BranchMergeJob: {
      id?: string
      source?: string
      target?: string
      scheduledDate?: string
      startDate?: string
      status?:
        | 'SCHEDULED'
        | 'IN_PROGRESS'
        | 'COMPLETED'
        | 'FAILED'
        | 'CONFLICTS'
      endDate?: string
      message?: string
      apiError?: components['schemas']['ApiError']
    }
    MergeReview: {
      id?: string
      sourcePath?: string
      targetPath?: string
      sourceToTargetReviewId?: string
      targetToSourceReviewId?: string
      status?: 'PENDING' | 'CURRENT' | 'STALE' | 'FAILED'
      message?: string
      created?: string
    }
    MergeReviewConceptVersions: {
      sourceConcept?: components['schemas']['Concept']
      targetConcept?: components['schemas']['Concept']
      autoMergedConcept?: components['schemas']['Concept']
      manuallyMergedConcept?: components['schemas']['Concept']
      targetConceptVersionBehind?: boolean
    }
    ImportJob: {
      status?: 'WAITING_FOR_FILE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
      errorMessage?: string
      branchPath?: string
      moduleIds?: string[]
      createCodeSystemVersion?: boolean
      patchReleaseVersion?: number
      internalRelease?: boolean
      type?: 'DELTA' | 'SNAPSHOT' | 'FULL'
    }
    ExportConfiguration: {
      id?: string
      startDate?: string
      branchPath: string
      type: 'DELTA' | 'SNAPSHOT' | 'FULL'
      filenameEffectiveDate?: string
      conceptsAndRelationshipsOnly?: boolean
      unpromotedChangesOnly?: boolean
      legacyZipNaming?: boolean
      /**
       * Format: yyyymmdd. Add a transient effectiveTime to rows of content which are not yet versioned.
       */
      transientEffectiveTime?: string
      /**
       * Format: yyyymmdd. Can be used to produce a delta after content is versioned by filtering a SNAPSHOT export by effectiveTime.
       */
      startEffectiveTime?: string
      moduleIds?: string[]
      /**
       * If refsetIds are included, this indicates that the export will be a refset-only export.
       */
      refsetIds?: string[]
      status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'DOWNLOADED' | 'FAILED'
      exportFilePath?: string
      startExport?: boolean
    }
    ItemsPageCodeSystem: {
      items?: components['schemas']['CodeSystem'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ItemsPageCodeSystemVersion: {
      items?: components['schemas']['CodeSystemVersion'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    CodeSystemUpgradeJob: {
      newDependantVersion?: number
      codeSystemShortname?: string
      status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
      errorMessage?: string
      creationTimestamp?: number
    }
    PageableObject: {
      pageNumber?: number
      pageSize?: number
      paged?: boolean
      unpaged?: boolean
      offset?: number
      sort?: components['schemas']['SortObject'][]
    }
    RefSetMemberPageWithBucketAggregationsReferenceSetMember: {
      content?: components['schemas']['ReferenceSetMember'][]
      pageable?: components['schemas']['PageableObject']
      memberCountsByReferenceSet?: { [key: string]: number }
      referenceSets?: { [key: string]: components['schemas']['ConceptMini'] }
      searchAfterArray?: { [key: string]: any }[]
      searchAfter?: string
      totalPages?: number
      totalElements?: number
      last?: boolean
      numberOfElements?: number
      size?: number
      number?: number
      sort?: components['schemas']['SortObject'][]
      first?: boolean
      empty?: boolean
    }
    ItemsPageConcept_Component: {
      items?: components['schemas']['Concept_Component'][]
      total?: number
      limit?: number
      offset?: number
      searchAfter?: string
      searchAfterArray?: { [key: string]: any }[]
    }
    ConceptHistory: {
      conceptId?: string
      history?: components['schemas']['ConceptHistoryItem'][]
    }
    ConceptHistoryItem: {
      effectiveTime?: string
      branch?: string
      componentTypes?: ('Concept' | 'Description' | 'Relationship' | 'Axiom')[]
    }
    AsyncConceptChangeBatch: {
      id?: string
      startTime?: string
      status?: 'RUNNING' | 'COMPLETED' | 'FAILED'
      conceptIds?: number[]
      endTime?: string
      message?: string
      secondsDuration?: number
    }
    Branch: {
      internalId?: string
      path?: string
      start?: string
      end?: string
      deleted?: boolean
      base?: string
      head?: string
      creation?: string
      lastPromotion?: string
      locked?: boolean
      containsContent?: boolean
      versionsReplaced?: { [key: string]: string[] }
      metadataInternal?: { [key: string]: string }
      metadata?: components['schemas']['Metadata']
      state?: 'UP_TO_DATE' | 'FORWARD' | 'BEHIND' | 'DIVERGED'
      headTimestamp?: number
      baseTimestamp?: number
      creationTimestamp?: number
      versionsReplacedCounts?: { [key: string]: number }
    }
    Metadata: { asMap?: { [key: string]: { [key: string]: any } } }
    PermissionRecord_Component: {
      role?: string
      path?: string
      global?: boolean
      userGroups?: string[]
    }
    RelationshipIdPojo: { relationshipIds?: string[] }
    MemberIdsPojo_Component: { memberIds?: string[] }
  }
}
