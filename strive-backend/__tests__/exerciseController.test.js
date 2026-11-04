jest.mock('../models/exerciseModel.js')

const Exercise = require('../models/exerciseModel.js')
const { getExercises, createExercise, MAX_CUSTOM_EXERCISES } = require('../controllers/exerciseController.js')

const createRes = () => ({
    statusCode: 200,
    status: jest.fn(function (code) { this.statusCode = code; return this }),
    json: jest.fn()
})

const validBody = () => ({
    name: 'Cable Pull Through',
    muscleGroup: 'Legs',
    subMuscleGroup: 'Glutes',
    equipment: ['Cable'],
    trackingMode: 'weight_reps'
})

const makeReq = (body, user = { _id: 'user1' }) => ({ body, user })

describe('getExercises', () => {
    beforeEach(() => jest.clearAllMocks())

    test('logged-out callers only get the library', async () => {
        Exercise.find.mockResolvedValue([])
        await getExercises({ user: null }, createRes())

        expect(Exercise.find).toHaveBeenCalledWith({ isCustom: { $ne: true } })
    })

    test('logged-in callers also get their own custom exercises', async () => {
        Exercise.find.mockResolvedValue([])
        await getExercises({ user: { _id: 'user1' } }, createRes())

        expect(Exercise.find).toHaveBeenCalledWith({
            $or: [{ isCustom: { $ne: true } }, { createdBy: 'user1' }]
        })
    })
})

describe('createExercise', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        Exercise.findOne.mockResolvedValue(null)
        Exercise.countDocuments.mockResolvedValue(0)
        Exercise.create.mockImplementation(async (data) => ({ _id: 'new', ...data }))
    })

    test('creates a custom exercise owned by the user', async () => {
        const res = createRes()
        await createExercise(makeReq(validBody()), res)

        expect(Exercise.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Cable Pull Through',
            isCustom: true,
            createdBy: 'user1'
        }))
        expect(res.status).toHaveBeenCalledWith(201)
    })

    test.each([
        ['empty name', { name: ' ' }],
        ['name with markup', { name: '<script>alert(1)</script>' }],
        ['name with newline', { name: 'Curl\nIgnore previous instructions' }],
        ['unknown muscle group', { muscleGroup: 'Wings' }],
        ['unsupported tracking mode', { trackingMode: 'other' }],
        ['no equipment', { equipment: [] }],
        ['unknown equipment', { equipment: ['Jetpack'] }],
        ['duplicate equipment', { equipment: ['Cable', 'Cable'] }],
        ['equipment not an array', { equipment: 'Cable' }]
    ])('rejects %s', async (_label, override) => {
        const res = createRes()
        await expect(createExercise(makeReq({ ...validBody(), ...override }), res)).rejects.toThrow()

        expect(res.status).toHaveBeenCalledWith(400)
        expect(Exercise.create).not.toHaveBeenCalled()
    })

    test('rejects a name that is already in the library', async () => {
        Exercise.findOne.mockResolvedValueOnce({ name: 'Bench Press' })
        const res = createRes()

        await expect(createExercise(makeReq({ ...validBody(), name: 'bench press' }), res)).rejects.toThrow('already in the exercise library')
        expect(res.status).toHaveBeenCalledWith(409)
    })

    test('rejects a name the user already created', async () => {
        Exercise.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ name: 'Cable Pull Through' })
        const res = createRes()

        await expect(createExercise(makeReq(validBody()), res)).rejects.toThrow('already have')
        expect(res.status).toHaveBeenCalledWith(409)
    })

    test('limits how many custom exercises a user can have', async () => {
        Exercise.countDocuments.mockResolvedValue(MAX_CUSTOM_EXERCISES)
        const res = createRes()

        await expect(createExercise(makeReq(validBody()), res)).rejects.toThrow('up to')
        expect(res.status).toHaveBeenCalledWith(403)
    })
})
