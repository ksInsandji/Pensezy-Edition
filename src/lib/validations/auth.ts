const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    'any.required': 'Le matricule ou l\'email est obligatoire',
    'string.empty': 'Ce champ ne peut pas être vide'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Le mot de passe est obligatoire',
    'string.empty': 'Le mot de passe ne peut pas être vide'
  })
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'L\'ancien mot de passe est obligatoire'
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      'any.required': 'Le nouveau mot de passe est obligatoire'
    })
});

const resetPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'L\'adresse email n\'est pas valide',
    'any.required': 'L\'email est obligatoire',
    'string.empty': 'L\'email ne peut pas être vide'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Le token est obligatoire',
    'string.empty': 'Le token ne peut pas être vide'
  }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le nouveau mot de passe est obligatoire'
    })
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema
};