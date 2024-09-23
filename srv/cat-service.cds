using my.researchData as my from '../db/schema';

service CatalogService {
    entity ResearchData as projection on my.ResearchData;
}
