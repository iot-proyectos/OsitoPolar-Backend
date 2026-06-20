import { Router } from 'express';
import { SectionController } from './section.controller';
import { authMiddleware, uploadSectionImage, validate } from '../../shared/middleware';
import { sectionIdParamSchema } from './section.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', SectionController.list);
router.post('/', uploadSectionImage.single('image'), SectionController.create);
router.get('/:id', validate(sectionIdParamSchema, 'params'), SectionController.getById);
router.put('/:id', validate(sectionIdParamSchema, 'params'), uploadSectionImage.single('image'), SectionController.update);
router.delete('/:id', validate(sectionIdParamSchema, 'params'), SectionController.delete);

export { router as sectionRoutes };
