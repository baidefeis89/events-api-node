-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 15-02-2018 a las 19:12:34
-- Versión del servidor: 10.1.21-MariaDB
-- Versión de PHP: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `svtickets`
--

DELIMITER $$
--
-- Funciones
--
CREATE DEFINER=`root`@`localhost` FUNCTION `haversine` (`lat1` FLOAT, `lon1` FLOAT, `lat2` FLOAT, `lon2` FLOAT) RETURNS FLOAT NO SQL
    DETERMINISTIC
    COMMENT 'Returns the distance in degrees on the Earth\r\n             between two known points of latitude and longitude'
BEGIN
    RETURN DEGREES(
        	ACOS(
              COS(RADIANS(lat1)) *
              COS(RADIANS(lat2)) *
              COS(RADIANS(lon2) - RADIANS(lon1)) +
              SIN(RADIANS(lat1)) * SIN(RADIANS(lat2))
            )
    	  )*111.045;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `event`
--

CREATE TABLE `event` (
  `id` int(10) UNSIGNED NOT NULL,
  `creator` int(10) UNSIGNED NOT NULL,
  `title` varchar(300) NOT NULL,
  `description` varchar(4000) NOT NULL,
  `date` datetime NOT NULL,
  `price` int(11) NOT NULL,
  `lat` decimal(9,6) NOT NULL,
  `lng` decimal(9,6) NOT NULL,
  `address` varchar(400) NOT NULL,
  `image` varchar(200) NOT NULL,
  `numAttend` int(10) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `event`
--

INSERT INTO `event` (`id`, `creator`, `title`, `description`, `date`, `price`, `lat`, `lng`, `address`, `image`, `numAttend`) VALUES
(1, 1, 'Test event mod', 'This event is for testing purposes. Do not sell or share.', '2017-10-30 12:00:00', 20, '38.495600', '-0.675600', 'Something Street', 'default.png', 2),
(2, 12, 'Test event', 'This event is for testing purposes. Do not sell or share.', '2017-10-30 12:00:00', 20, '0.000000', '0.000000', 'Something Street', 'default.png', 2),
(3, 12, 'Test event', 'This event is for testing purposes. Do not sell or share.', '2017-10-30 12:00:00', 20, '38.495600', '-0.675600', 'Something Street', 'default.png', 1),
(14, 12, 'EVent', 'Desc', '2018-12-18 00:00:00', 12, '0.000000', '0.000000', 'ADDRESS', '1516539178133.jpg', 8),
(16, 12, 'new event', 'Description', '2018-12-12 00:00:00', 13, '0.000000', '0.000000', 'ADDRESS', '1516539405933.jpg', 1),
(21, 122, 'Angel Martín', 'Description', '2018-12-09 00:00:00', 12, '38.347823', '-0.489047', 'calle alfonso el sabio, alicante', '1517481778237.jpg', 1),
(22, 122, 'Event2', 'Description', '2018-12-16 00:00:00', 10, '38.360613', '-0.479472', 'calle pradilla ', '1517481828631.jpg', 0),
(23, 122, 'Event', 'Des', '2222-02-12 00:00:00', 12, '38.346236', '-0.491354', '', '1517482443478.jpg', 0),
(24, 122, 'New Event 2', 'Desc', '2020-12-18 00:00:00', 1, '38.361266', '-0.492603', 'avenida novelda 33, a', '1517482562948.jpg', 0),
(25, 122, 'asdff', 'desc', '2018-12-18 00:00:00', 1, '38.347936', '-0.491485', 'Benito perez ', '1517483361581.jpg', 0),
(26, 122, 'Eventito', 'Eventito description', '2222-12-20 00:00:00', 12, '38.348823', '-0.489516', 'avenida benito perez galdos 5', '1517483444996.jpg', 1),
(28, 122, 'Final Event', 'Final description', '2018-12-15 00:00:00', 26, '40.712775', '-74.005973', 'new y', '1518202490342.jpg', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `avatar` varchar(250) NOT NULL,
  `lat` decimal(9,6) NOT NULL,
  `lng` decimal(9,6) NOT NULL,
  `id_google` varchar(100) DEFAULT NULL,
  `id_facebook` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `avatar`, `lat`, `lng`, `id_google`, `id_facebook`) VALUES
(1, 'Person Test', 'test@email.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '1516613940091.jpg', '38.546300', '-0.629320', NULL, NULL),
(2, 'Ivan', 'asdf@asdf.es', 'f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b', '1516613940091.jpg', '38.404706', '-0.529320', NULL, NULL),
(3, 'Test Person', 'test@test.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '1516613940091.jpg', '38.404706', '-0.529320', NULL, NULL),
(5, 'Ivan', 'email@email.es', 'e10adc3949ba59abbe56e057f20f883e', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(12, 'Ivan', 'prueba@prueba', 'c893bad68927b457dbed39460e6afd62', '1516613940091.jpg', '38.404706', '-0.529320', NULL, NULL),
(28, 'Ivan', 'prueba@prueba.es', 'c893bad68927b457dbed39460e6afd62', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(33, 'Name', 'asdf@asdf', '81dc9bdb52d04dc20036dbd8313ed055', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(35, 'Name', 'asdf@asdf2', '81dc9bdb52d04dc20036dbd8313ed055', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(58, 'Name', 'asdf@asdf3', '81dc9bdb52d04dc20036dbd8313ed055', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(63, 'Name', 'asdf@asdf4', '81dc9bdb52d04dc20036dbd8313ed055', '1516613940091.jpg', '0.000000', '0.000000', NULL, NULL),
(66, 'Pepe', 'pepe@pepe', '926e27eecdbc7a18858b3798ba99bddd', '1516613940091.jpg', '38.361180', '-0.492593', NULL, NULL),
(67, 'blanca', 'blanca@blanca', '1d0f769d73278ddc6e765f88265e18b6', '1516613940091.jpg', '38.361167', '-0.492595', NULL, NULL),
(128, 'UsuarioConGeoloc', 'usuario@usuario', 'f8032d5cae3de20fcec887f395ec9a6a', '1516613940091.jpg', '38.361194', '-0.492522', NULL, NULL),
(136, 'aaa', 'aaa@aaa', '47bce5c74f589f4867dbd57e9ca9f808', '1518428147740.jpg', '0.000000', '0.000000', NULL, NULL),
(137, 'miau', 'miau@miau', '50941bf460efcb1356249a2e5018f8c8', '1518428384725.jpg', '38.361198', '-0.492552', NULL, NULL),
(138, 'test', 'test@test', '098f6bcd4621d373cade4e832627b4f6', '1518428485518.jpg', '0.000000', '0.000000', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_attend_event`
--

CREATE TABLE `user_attend_event` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user` int(10) UNSIGNED NOT NULL,
  `event` int(10) UNSIGNED NOT NULL,
  `tickets` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `user_attend_event`
--

INSERT INTO `user_attend_event` (`id`, `user`, `event`, `tickets`) VALUES
(1, 1, 1, 1),
(2, 12, 1, 1),
(3, 12, 2, 1),
(4, 12, 3, 1),
(16, 122, 2, 1),
(5, 122, 14, 1),
(6, 122, 14, 1),
(7, 122, 14, 1),
(8, 122, 14, 2),
(9, 122, 14, 6),
(10, 122, 14, 1),
(11, 122, 14, 3),
(12, 122, 14, 1),
(13, 122, 16, 2),
(14, 122, 21, 2),
(15, 122, 26, 1);

--
-- Disparadores `user_attend_event`
--
DELIMITER $$
CREATE TRIGGER `user attends event` AFTER INSERT ON `user_attend_event` FOR EACH ROW UPDATE event SET numAttend = numAttend + 1 WHERE id = NEW.event
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `user not attend event` AFTER DELETE ON `user_attend_event` FOR EACH ROW UPDATE event SET numAttend = numAttend - 1 WHERE id = OLD.event
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator` (`creator`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `id_google` (`id_google`),
  ADD UNIQUE KEY `id_facebook` (`id_facebook`);

--
-- Indices de la tabla `user_attend_event`
--
ALTER TABLE `user_attend_event`
  ADD PRIMARY KEY (`user`,`event`,`id`) USING BTREE,
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `event` (`event`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `event`
--
ALTER TABLE `event`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;
--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;
--
-- AUTO_INCREMENT de la tabla `user_attend_event`
--
ALTER TABLE `user_attend_event`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `event`
--
ALTER TABLE `event`
  ADD CONSTRAINT `event_ibfk_1` FOREIGN KEY (`creator`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_attend_event`
--
ALTER TABLE `user_attend_event`
  ADD CONSTRAINT `user_attend_event_ibfk_1` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_attend_event_ibfk_2` FOREIGN KEY (`event`) REFERENCES `event` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
